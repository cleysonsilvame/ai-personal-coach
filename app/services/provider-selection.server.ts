import { injectable, inject } from "inversify";
import { JSDOM } from "jsdom";
import OpenAI from "openai";
import { Config } from "~/lib/config";

// Constants for URLs and blacklist duration
const CHAT_MODELS_URL = "https://openrouter.ai/models?fmt=table&max_price=0&order=top-weekly&supported_parameters=response_format";
const COPILOT_MODELS_URL = "https://openrouter.ai/models?fmt=table&max_price=0&order=top-weekly&supported_parameters=tools";
const BLACKLIST_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

interface BlacklistEntry {
	model: string;
	expiresAt: number;
}

/**
 * Service to dynamically select the best available model from OpenRouter
 * Implements singleton pattern with web scraping and health checks
 */
@injectable("Singleton")
export class ProviderSelectionService {
	private chatModel: string | null = null;
	private copilotModel: string | null = null;
	private blacklist: BlacklistEntry[] = [];
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
			if (this.chatModel) {
				this.addToBlacklist(this.chatModel);
			}
			this.chatModel = null;
		} else {
			console.log(`Resetting copilot model cache: ${this.copilotModel}`);
			if (this.copilotModel) {
				this.addToBlacklist(this.copilotModel);
			}
			this.copilotModel = null;
		}
	}

	/**
	 * Add a model to the blacklist for 8 hours
	 */
	private addToBlacklist(model: string): void {
		const expiresAt = Date.now() + BLACKLIST_DURATION_MS;
		this.blacklist.push({ model, expiresAt });
		console.log(`Added ${model} to blacklist until ${new Date(expiresAt).toISOString()}`);
	}

	/**
	 * Check if a model is currently blacklisted
	 */
	private isBlacklisted(model: string): boolean {
		// Clean up expired entries
		const now = Date.now();
		this.blacklist = this.blacklist.filter(entry => entry.expiresAt > now);
		
		return this.blacklist.some(entry => entry.model === model);
	}

	/**
	 * Fetch the most popular free model from OpenRouter for chat
	 * Uses web scraping to get models in order of weekly popularity
	 */
	private async fetchBestChatModel(): Promise<string> {
		try {
			console.log("Fetching chat models from OpenRouter...");
			const modelIds = await this.scrapeModelIds(CHAT_MODELS_URL);
			
			if (modelIds.length === 0) {
				console.warn("No chat models found via scraping, falling back to default");
				return this.config.env.OPEN_ROUTER_MODEL;
			}

			// Try each model in order until we find one that's not blacklisted and passes health check
			for (const modelId of modelIds) {
				if (this.isBlacklisted(modelId)) {
					console.log(`Skipping blacklisted model: ${modelId}`);
					continue;
				}

				console.log(`Testing chat model: ${modelId}`);
				const isHealthy = await this.healthCheckModel(modelId);
				
				if (isHealthy) {
					console.log(`✓ Selected chat model: ${modelId}`);
					return modelId;
				}

				console.warn(`✗ Model ${modelId} failed health check, adding to blacklist`);
				this.addToBlacklist(modelId);
			}

			// If all models failed, use default
			console.warn("All chat models failed health check, using default");
			return this.config.env.OPEN_ROUTER_MODEL;
		} catch (error) {
			console.error("Error fetching best chat model:", error);
			return this.config.env.OPEN_ROUTER_MODEL;
		}
	}

	/**
	 * Fetch the most popular free model with tool support from OpenRouter
	 * Uses web scraping to get models in order of weekly popularity
	 */
	private async fetchBestCopilotModel(): Promise<string> {
		try {
			console.log("Fetching copilot models from OpenRouter...");
			const modelIds = await this.scrapeModelIds(COPILOT_MODELS_URL);
			
			if (modelIds.length === 0) {
				console.warn("No copilot models found via scraping, falling back to default");
				return this.config.env.OPEN_ROUTER_MODEL;
			}

			// Try each model in order until we find one that's not blacklisted and passes health check
			for (const modelId of modelIds) {
				if (this.isBlacklisted(modelId)) {
					console.log(`Skipping blacklisted model: ${modelId}`);
					continue;
				}

				console.log(`Testing copilot model: ${modelId}`);
				const isHealthy = await this.healthCheckModel(modelId);
				
				if (isHealthy) {
					console.log(`✓ Selected copilot model: ${modelId}`);
					return modelId;
				}

				console.warn(`✗ Model ${modelId} failed health check, adding to blacklist`);
				this.addToBlacklist(modelId);
			}

			// If all models failed, use default
			console.warn("All copilot models failed health check, using default");
			return this.config.env.OPEN_ROUTER_MODEL;
		} catch (error) {
			console.error("Error fetching best copilot model:", error);
			return this.config.env.OPEN_ROUTER_MODEL;
		}
	}

	/**
	 * Scrape model IDs from OpenRouter models page
	 * Models are returned in order of weekly popularity
	 */
	private async scrapeModelIds(url: string): Promise<string[]> {
		try {
			const response = await fetch(url);
			
			if (!response.ok) {
				throw new Error(`Failed to fetch models page: ${response.status} ${response.statusText}`);
			}

			const html = await response.text();
			const dom = new JSDOM(html);
			const document = dom.window.document;

			// Find all model links in the table
			// OpenRouter uses <a> tags with href="/models/{model-id}" for model links
			const modelLinks = document.querySelectorAll('a[href^="/models/"]');
			const modelIds: string[] = [];

			for (const link of modelLinks) {
				const href = link.getAttribute('href');
				if (href) {
					// Extract model ID from href: /models/vendor/model-name -> vendor/model-name
					const modelId = href.replace('/models/', '');
					if (modelId && !modelIds.includes(modelId)) {
						modelIds.push(modelId);
					}
				}
			}

			console.log(`Found ${modelIds.length} models from ${url}`);
			return modelIds;
		} catch (error) {
			console.error(`Error scraping models from ${url}:`, error);
			return [];
		}
	}

	/**
	 * Perform health check on a model
	 * Tests if the model is available and responding
	 */
	private async healthCheckModel(modelId: string): Promise<boolean> {
		try {
			const response = await this.openRouterClient.chat.completions.create({
				model: modelId,
				messages: [
					{
						role: "system",
						content: "health check",
					},
				],
				max_tokens: 1,
				stream: false,
			});

			// If we get a response, the model is healthy
			return response.choices && response.choices.length > 0;
		} catch (error: any) {
			console.error(`Health check failed for ${modelId}:`, error?.message || error);
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
