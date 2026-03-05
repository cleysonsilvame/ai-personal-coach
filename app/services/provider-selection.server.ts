import { inject, injectable } from "inversify";
import OpenAI from "openai";
import { Config } from "~/lib/config";
import { FeatureFlags } from "~/lib/feature-flags.server";
import { Logger } from "~/lib/logger";
import { RedisModelBlacklistService } from "./model-blacklist.server";
import { NotificationService } from "./notification.server";

// Constants for API endpoint
const OPENROUTER_FRONTEND_API_URL =
	"https://openrouter.ai/api/frontend/models/find";

interface OpenRouterFrontendModel {
	slug: string;
	name: string;
	context_length: number;
	endpoint: {
		model_variant_slug: string;
		pricing: {
			prompt: string;
			completion: string;
		};
		supported_parameters: string[];
		is_free: boolean;
	};
}

interface OpenRouterFrontendResponse {
	data: {
		models: OpenRouterFrontendModel[];
	};
}

/**
 * Service to dynamically select the best available model from OpenRouter
 * Implements singleton pattern with API-based model selection and health checks
 * Sends notifications when models fail via NotificationService
 * Uses Redis for distributed blacklist management across multiple instances
 */
@injectable("Singleton")
export class ProviderSelectionService {
	private chatModel: string | null = null;
	private copilotModel: string | null = null;
	private readonly openRouterClient: OpenAI;

	constructor(
		@inject(Config) private readonly config: Config,
		@inject(NotificationService)
		private readonly notificationService: NotificationService,
		@inject(Logger) private readonly logger: Logger,
		@inject(FeatureFlags) private readonly featureFlags: FeatureFlags,
		@inject(RedisModelBlacklistService)
		private readonly blacklistService: RedisModelBlacklistService,
	) {
		this.openRouterClient = new OpenAI({
			apiKey: this.config.env.OPEN_ROUTER_API_KEY,
			baseURL: this.config.env.OPEN_ROUTER_BASE_URL,
		});
	}

	/**
	 * Get the best model for chat use case
	 * Fetches from OpenRouter API on first call or when model becomes unavailable
	 */
	async getChatModel(): Promise<string> {
		if (!(await this.shouldUseDynamicSelection("chat"))) {
			return this.config.env.OPEN_ROUTER_MODEL;
		}

		if (!this.chatModel) {
			this.chatModel = await this.fetchBestChatModel();
		}
		return this.chatModel;
	}

	/**
	 * Get the best model for copilot use case (requires tool support)
	 * Fetches from OpenRouter API on first call or when model becomes unavailable
	 */
	async getCopilotModel(): Promise<string> {
		if (!(await this.shouldUseDynamicSelection("copilot"))) {
			return this.config.env.OPEN_ROUTER_MODEL;
		}

		if (!this.copilotModel) {
			this.copilotModel = await this.fetchBestCopilotModel();
		}
		return this.copilotModel;
	}

	private async shouldUseDynamicSelection(
		useCase: "chat" | "copilot",
	): Promise<boolean> {
		try {
			const flags = await this.featureFlags.getFeatureFlags();
			return useCase === "chat"
				? flags.chat_use_dynamic_model_selection
				: flags.copilot_use_dynamic_model_selection;
		} catch (error) {
			this.logger.warn(
				`Feature flags unavailable for ${useCase}; using fixed OPEN_ROUTER_MODEL`,
				error,
			);
			return false;
		}
	}

	/**
	 * Reset cached model for a specific use case
	 * Called when a model becomes unavailable
	 */
	async resetModel(useCase: "chat" | "copilot"): Promise<void> {
		if (useCase === "chat") {
			this.logger.info(`Resetting chat model cache: ${this.chatModel}`);
			if (this.chatModel) {
				await this.blacklistService.addToBlacklist(this.chatModel);
			}
			this.chatModel = null;
		} else {
			this.logger.info(`Resetting copilot model cache: ${this.copilotModel}`);
			if (this.copilotModel) {
				await this.blacklistService.addToBlacklist(this.copilotModel);
			}
			this.copilotModel = null;
		}
	}

	/**
	 * Add a model to the blacklist for 8 hours
	 * Uses Redis for distributed blacklist management
	 */
	private async addToBlacklistInternal(model: string): Promise<void> {
		await this.blacklistService.addToBlacklist(model);
		this.logger.debug(
			`Added ${model} to blacklist for 8 hours (stored in Redis)`,
		);
	}

	/**
	 * Check if a model is currently blacklisted
	 */
	private async isBlacklistedInternal(model: string): Promise<boolean> {
		return this.blacklistService.isBlacklisted(model);
	}

	/**
	 * Fetch the most popular free model from OpenRouter for chat
	 * Uses OpenRouter API to get models with response_format support
	 */
	private async fetchBestChatModel(): Promise<string> {
		try {
			this.logger.info("Fetching chat models from OpenRouter API...");
			const modelIds = await this.fetchModelIds(["response_format"]);

			if (modelIds.length === 0) {
				this.logger.warn(
					"⚠️  No chat models found via API, falling back to default",
				);
				return this.config.env.OPEN_ROUTER_MODEL;
			}

			this.logger.info(`Processing ${modelIds.length} chat models...`);

			// Try each model in order until we find one that's not blacklisted and passes health check
			for (const modelId of modelIds) {
				const isBlacklistedModel = await this.isBlacklistedInternal(modelId);
				if (isBlacklistedModel) {
					this.logger.debug(`Skipping blacklisted model: ${modelId}`);
					continue;
				}

				this.logger.debug(`Testing chat model: ${modelId}`);
				const isHealthy = await this.healthCheckModel(modelId);

				if (isHealthy) {
					this.logger.info(`✓ Selected chat model: ${modelId}`);
					return modelId;
				}

				this.logger.warn(
					`✗ Model ${modelId} failed health check, adding to blacklist`,
				);
				await this.addToBlacklistInternal(modelId);

				// Notify about model failure
				await this.notificationService.notifyModelError({
					type: "model_unavailable",
					modelId,
					error: "Model failed health check",
					timestamp: new Date().toISOString(),
					context: { useCase: "chat" },
				});
			}

			// If all models failed, use default
			this.logger.warn("All chat models failed health check, using default");

			// Notify about all models failing
			await this.notificationService.notifyModelError({
				type: "all_models_failed",
				error: "All chat models failed health check, using fallback",
				timestamp: new Date().toISOString(),
				context: {
					useCase: "chat",
					fallbackModel: this.config.env.OPEN_ROUTER_MODEL,
					testedModels: modelIds.length,
				},
			});

			return this.config.env.OPEN_ROUTER_MODEL;
		} catch (error) {
			this.logger.error("Error fetching best chat model:", error);

			// Notify about error
			await this.notificationService.notifyModelError({
				type: "model_error",
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString(),
				context: { useCase: "chat", phase: "fetching" },
			});

			return this.config.env.OPEN_ROUTER_MODEL;
		}
	}

	/**
	 * Fetch the most popular free model with tool support from OpenRouter
	 * Uses OpenRouter API to get models with tools support
	 */
	private async fetchBestCopilotModel(): Promise<string> {
		try {
			this.logger.info("Fetching copilot models from OpenRouter API...");
			const modelIds = await this.fetchModelIds(["tools"]);

			if (modelIds.length === 0) {
				this.logger.warn(
					"⚠️  No copilot models found via API, falling back to default",
				);
				return this.config.env.OPEN_ROUTER_MODEL;
			}

			this.logger.info(`Processing ${modelIds.length} copilot models...`);

			// Try each model in order until we find one that's not blacklisted and passes health check
			for (const modelId of modelIds) {
				const isBlacklistedModel = await this.isBlacklistedInternal(modelId);
				if (isBlacklistedModel) {
					this.logger.debug(`Skipping blacklisted model: ${modelId}`);
					continue;
				}

				this.logger.debug(`Testing copilot model: ${modelId}`);
				const isHealthy = await this.healthCheckModel(modelId);

				if (isHealthy) {
					this.logger.info(`✓ Selected copilot model: ${modelId}`);
					return modelId;
				}

				this.logger.warn(
					`✗ Model ${modelId} failed health check, adding to blacklist`,
				);
				await this.addToBlacklistInternal(modelId);

				// Notify about model failure
				await this.notificationService.notifyModelError({
					type: "model_unavailable",
					modelId,
					error: "Model failed health check",
					timestamp: new Date().toISOString(),
					context: { useCase: "copilot" },
				});
			}

			// If all models failed, use default
			this.logger.warn("All copilot models failed health check, using default");

			// Notify about all models failing
			await this.notificationService.notifyModelError({
				type: "all_models_failed",
				error: "All copilot models failed health check, using fallback",
				timestamp: new Date().toISOString(),
				context: {
					useCase: "copilot",
					fallbackModel: this.config.env.OPEN_ROUTER_MODEL,
					testedModels: modelIds.length,
				},
			});
			return this.config.env.OPEN_ROUTER_MODEL;
		} catch (error) {
			this.logger.error("Error fetching best copilot model:", error);
			// Notify about error
			await this.notificationService.notifyModelError({
				type: "model_error",
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString(),
				context: { useCase: "copilot", phase: "fetching" },
			});
			return this.config.env.OPEN_ROUTER_MODEL;
		}
	}

	/**
	 * Fetch model IDs from OpenRouter Frontend API
	 * Returns free models ordered by popularity that support the required parameters
	 */
	private async fetchModelIds(requiredParameters: string[]): Promise<string[]> { // TODO: adicionar cache?
		this.logger.debug(
			`[API] Fetching models with parameters: ${requiredParameters.join(", ")}`,
		);

		try {
			// Build query parameters for the frontend API
			const params = new URLSearchParams({
				fmt: "table",
				max_price: "0",
				order: "most-popular",
				supported_parameters: requiredParameters.join(","),
			});

			const url = `${OPENROUTER_FRONTEND_API_URL}?${params.toString()}`;
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(
					`Failed to fetch models: ${response.status} ${response.statusText}`,
				);
			}

			this.logger.debug(`[API] Response status: ${response.status}`);

			const result = (await response.json()) as OpenRouterFrontendResponse;
			const models = result.data.models;

			this.logger.debug(
				`[API] Received ${models.length} free models ordered by popularity`,
			);

			// Extract model IDs (already filtered by API for free + required parameters)
			const modelIds = models.map((model) => model.endpoint.model_variant_slug);

			if (modelIds.length > 0) {
				this.logger.debug("[API] Top 3 models:", modelIds.slice(0, 3));
			} else {
				this.logger.warn("[API] ⚠️  No matching models found!");
			}

			return modelIds;
		} catch (error: unknown) {
			if (error instanceof Error) {
				this.logger.error("[API] ❌ Error fetching models:", error.message);
			} else {
				this.logger.error("[API] ❌ Unknown error fetching models", error);
			}
			return [];
		}
	}

	/**
	 * Perform health check on a model
	 * Tests if the model is available and responding
	 * Uses minimal request (1 token) to reduce API quota consumption
	 */
	private async healthCheckModel(modelId: string): Promise<boolean> {
		try {
			// Set a timeout to prevent hanging
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

			const response = await this.openRouterClient.chat.completions.create(
				{
					model: modelId,
					messages: [
						{
							role: "system",
							content: "health check",
						},
					],
					max_tokens: 1,
					stream: false,
				},
				{
					signal: controller.signal as AbortSignal,
				},
			);

			clearTimeout(timeoutId);

			// If we get a response, the model is healthy
			return response.choices && response.choices.length > 0;
		} catch (error: unknown) {
			if (error instanceof Error) {
				if (error.name === "AbortError") {
					this.logger.error(`Health check timeout for ${modelId}`);
				} else {
					this.logger.error(`Health check failed for ${modelId}:`, error.message);
				}
			} else {
				console.error(`Unknown health check error for ${modelId}`);
			}
			return false;
		}
	}

	/**
	 * Check if an error indicates the model is unavailable
	 * This can be used to implement retry logic with fallback models
	 */
	isModelUnavailableError(error: unknown): boolean {
		if (!error) return false;

		// Safely extract error message
		const errorMessage =
			error instanceof Error ? error.message?.toLowerCase() || "" : "";
		// Check both direct status and response.status for different error types
		const errorStatus =
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(error as any)?.status || (error as any)?.response?.status;

		return (
			errorStatus === 404 ||
			errorStatus === 503 ||
			errorMessage.includes("not found") ||
			errorMessage.includes("unavailable") ||
			errorMessage.includes("offline") ||
			errorMessage.includes("does not exist")
		);
	}
}
