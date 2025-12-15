import { injectable, inject } from "inversify";
import OpenAI from "openai";
import { Config } from "~/lib/config";

interface OpenRouterModel {
	id: string;
	name: string;
	pricing: {
		prompt: string;
		completion: string;
	};
	context_length: number;
	top_provider?: {
		max_completion_tokens?: number;
		is_moderated: boolean;
	};
	supported_parameters?: string[];
}

interface OpenRouterModelsResponse {
	data: OpenRouterModel[];
}

/**
 * Service to dynamically select the best available model from OpenRouter
 * Implements singleton pattern - fetches models once and caches until failure
 */
@injectable("Singleton")
export class ProviderSelectionService {
	private chatModel: string | null = null;
	private copilotModel: string | null = null;
	private readonly openRouterClient: OpenAI;

	constructor(@inject(Config) private readonly config: Config) {
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
		if (!this.copilotModel) {
			this.copilotModel = await this.fetchBestCopilotModel();
		}
		return this.copilotModel;
	}

	/**
	 * Reset cached model for a specific use case
	 * Called when a model becomes unavailable
	 */
	resetModel(useCase: "chat" | "copilot"): void {
		if (useCase === "chat") {
			console.log(`Resetting chat model cache: ${this.chatModel}`);
			this.chatModel = null;
		} else {
			console.log(`Resetting copilot model cache: ${this.copilotModel}`);
			this.copilotModel = null;
		}
	}

	/**
	 * Fetch the most popular free model from OpenRouter for chat
	 */
	private async fetchBestChatModel(): Promise<string> {
		try {
			const models = await this.fetchAvailableModels();
			
			// Filter for free models (pricing = "0")
			const freeModels = models.filter(
				(model) => model.pricing.prompt === "0" && model.pricing.completion === "0"
			);

			if (freeModels.length === 0) {
				console.warn("No free models found, falling back to default");
				return this.config.env.OPEN_ROUTER_MODEL;
			}

			// Return the first free model (OpenRouter API returns models sorted by popularity)
			const bestModel = freeModels[0];
			console.log(`Selected best free chat model: ${bestModel.id} (${bestModel.name})`);
			return bestModel.id;
		} catch (error) {
			console.error("Error fetching best chat model:", error);
			return this.config.env.OPEN_ROUTER_MODEL;
		}
	}

	/**
	 * Fetch the most popular free model with tool support from OpenRouter
	 */
	private async fetchBestCopilotModel(): Promise<string> {
		try {
			const models = await this.fetchAvailableModels();
			
			// Filter for free models with tool/function calling support
			const freeModelsWithTools = models.filter((model) => {
				const isFree = model.pricing.prompt === "0" && model.pricing.completion === "0";
				const supportsTools = model.supported_parameters?.includes("tools") || 
					model.supported_parameters?.includes("functions");
				return isFree && supportsTools;
			});

			if (freeModelsWithTools.length === 0) {
				console.warn("No free models with tool support found, falling back to best free model without tools");
				
				// Try to find any free model without tool requirement
				const freeModels = models.filter(
					(model) => model.pricing.prompt === "0" && model.pricing.completion === "0"
				);
				
				if (freeModels.length > 0) {
					const fallbackModel = freeModels[0];
					console.log(`Selected best free copilot model (no tools): ${fallbackModel.id} (${fallbackModel.name})`);
					return fallbackModel.id;
				}
				
				// Last resort: use configured default
				console.warn("No free models found at all, using configured default");
				return this.config.env.OPEN_ROUTER_MODEL;
			}

			// Return the first free model with tools (sorted by popularity)
			const bestModel = freeModelsWithTools[0];
			console.log(`Selected best free copilot model with tools: ${bestModel.id} (${bestModel.name})`);
			return bestModel.id;
		} catch (error) {
			console.error("Error fetching best copilot model:", error);
			return this.config.env.OPEN_ROUTER_MODEL;
		}
	}

	/**
	 * Fetch available models from OpenRouter API
	 */
	private async fetchAvailableModels(): Promise<OpenRouterModel[]> {
		try {
			// Build the API endpoint from base URL
			const modelsUrl = `${this.config.env.OPEN_ROUTER_BASE_URL}/models`;
			
			const response = await fetch(modelsUrl, {
				headers: {
					"Authorization": `Bearer ${this.config.env.OPEN_ROUTER_API_KEY}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
			}

			const data = await response.json() as OpenRouterModelsResponse;
			return data.data || [];
		} catch (error) {
			console.error("Error fetching models from OpenRouter:", error);
			throw error;
		}
	}

	/**
	 * Check if an error indicates the model is unavailable
	 * This can be used to implement retry logic with fallback models
	 */
	isModelUnavailableError(error: unknown): boolean {
		if (!error) return false;

		// Safely extract error message
		const errorMessage = error instanceof Error 
			? error.message?.toLowerCase() || ""
			: "";
		// Check both direct status and response.status for different error types
		const errorStatus = (error as any)?.status || (error as any)?.response?.status;

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
