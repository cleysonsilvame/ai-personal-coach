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
	 * Automatically cleans up expired entries to prevent memory leaks
	 */
	private addToBlacklist(model: string): void {
		// Clean up expired entries first
		this.cleanupBlacklist();
		
		const expiresAt = Date.now() + BLACKLIST_DURATION_MS;
		this.blacklist.push({ model, expiresAt });
		console.log(`Added ${model} to blacklist until ${new Date(expiresAt).toISOString()}`);
	}

	/**
	 * Check if a model is currently blacklisted
	 */
	private isBlacklisted(model: string): boolean {
		return this.blacklist.some(entry => entry.model === model && entry.expiresAt > Date.now());
	}

	/**
	 * Clean up expired blacklist entries to prevent memory leaks
	 */
	private cleanupBlacklist(): void {
		const now = Date.now();
		const beforeCount = this.blacklist.length;
		this.blacklist = this.blacklist.filter(entry => entry.expiresAt > now);
		const removedCount = beforeCount - this.blacklist.length;
		if (removedCount > 0) {
			console.log(`Cleaned up ${removedCount} expired blacklist entries`);
		}
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
	 * Note: This relies on OpenRouter's HTML structure. If they change their markup,
	 * the scraping may fail and fall back to the default model.
	 */
	private async scrapeModelIds(url: string): Promise<string[]> {
		try {
			// Fetch with timeout to prevent hanging
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

			const response = await fetch(url, { 
				signal: controller.signal,
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; AI-Personal-Coach/1.0)',
				}
			});
			clearTimeout(timeoutId);
			
			if (!response.ok) {
				throw new Error(`Failed to fetch models page: ${response.status} ${response.statusText}`);
			}

			const html = await response.text();
			
			// Parse HTML with JSDOM (content is from trusted source - OpenRouter)
			const dom = new JSDOM(html);
			const document = dom.window.document;

			// Find all model links - try multiple selectors for robustness
			// Primary: links in table with /models/ prefix
			let modelLinks = document.querySelectorAll('a[href^="/models/"]');
			
			// Fallback: try data attributes if structure changes
			if (modelLinks.length === 0) {
				modelLinks = document.querySelectorAll('[data-model-id]');
			}

			const modelIds: string[] = [];

			for (const link of modelLinks) {
				// Try href attribute first
				let modelId = link.getAttribute('href')?.replace('/models/', '');
				
				// Fallback to data attribute
				if (!modelId) {
					modelId = link.getAttribute('data-model-id') || '';
				}
				
				// Validate model ID format (vendor/model-name)
				if (modelId && modelId.includes('/') && !modelIds.includes(modelId)) {
					modelIds.push(modelId);
				}
			}

			console.log(`Found ${modelIds.length} models from ${url}`);
			return modelIds;
		} catch (error: unknown) {
			if (error instanceof Error) {
				if (error.name === 'AbortError') {
					console.error(`Timeout scraping models from ${url}`);
				} else {
					console.error(`Error scraping models from ${url}:`, error.message);
				}
			} else {
				console.error(`Unknown error scraping models from ${url}`);
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
					signal: controller.signal as any,
				}
			);

			clearTimeout(timeoutId);

			// If we get a response, the model is healthy
			return response.choices && response.choices.length > 0;
		} catch (error: unknown) {
			if (error instanceof Error) {
				if (error.name === 'AbortError') {
					console.error(`Health check timeout for ${modelId}`);
				} else {
					console.error(`Health check failed for ${modelId}:`, error.message);
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
