import { injectable, inject } from "inversify";
import { chromium, type Browser, type Page } from "playwright";
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
 * Implements singleton pattern with browser-based web scraping and health checks
 */
@injectable("Singleton")
export class ProviderSelectionService {
	private chatModel: string | null = null;
	private copilotModel: string | null = null;
	private blacklist: BlacklistEntry[] = [];
	private readonly openRouterClient: OpenAI;
	private browser: Browser | null = null;

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
				console.warn("⚠️  No chat models found via scraping, falling back to default");
				console.warn("Reason: Scraping returned 0 models. Check logs above for details (HTTP status, HTML structure, selectors)");
				return this.config.env.OPEN_ROUTER_MODEL;
			}

			console.log(`Processing ${modelIds.length} chat models...`);

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
				console.warn("⚠️  No copilot models found via scraping, falling back to default");
				console.warn("Reason: Scraping returned 0 models. Check logs above for details (HTTP status, HTML structure, selectors)");
				return this.config.env.OPEN_ROUTER_MODEL;
			}

			console.log(`Processing ${modelIds.length} copilot models...`);

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
	 * Get or create browser instance
	 * Reuses browser across scraping operations
	 */
	private async getBrowser(): Promise<Browser> {
		if (!this.browser) {
			console.log(`[Browser] Launching Chromium...`);
			this.browser = await chromium.launch({
				headless: true,
				args: ['--no-sandbox', '--disable-setuid-sandbox'],
			});
		}
		return this.browser;
	}

	/**
	 * Scrape model IDs from OpenRouter models page using real browser
	 * Models are returned in order of weekly popularity
	 * Uses Playwright to render JavaScript and execute client-side code
	 */
	private async scrapeModelIds(url: string): Promise<string[]> {
		console.log(`[Scraping] Starting browser-based scrape from: ${url}`);
		
		let page: Page | null = null;
		
		try {
			const browser = await this.getBrowser();
			page = await browser.newPage();
			
			// Set user agent
			await page.setExtraHTTPHeaders({
				'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
			});
			
			console.log(`[Scraping] Navigating to page...`);
			
			// Navigate with timeout
			const response = await page.goto(url, {
				timeout: 30000, // 30 second timeout
				waitUntil: 'networkidle', // Wait for network to be idle
			});
			
			if (!response) {
				throw new Error('No response received from page');
			}
			
			console.log(`[Scraping] Response status: ${response.status()}`);
			
			if (!response.ok()) {
				throw new Error(`Failed to fetch models page: ${response.status()} ${response.statusText()}`);
			}

			// Wait for page to fully render - look for model links
			console.log(`[Scraping] Waiting for page to render...`);
			
			try {
				// Wait for either model links or a reasonable timeout
				await page.waitForSelector('a[href^="/models/"]', { timeout: 10000 });
				console.log(`[Scraping] Model links found in DOM`);
			} catch (timeoutError) {
				console.warn(`[Scraping] Timeout waiting for model links, proceeding anyway...`);
			}
			
			// Give additional time for JavaScript to finish rendering
			await page.waitForTimeout(2000);
			
			// Extract model IDs from the rendered page
			console.log(`[Scraping] Extracting model IDs...`);
			
			const modelData = await page.evaluate(() => {
				// Find all model links
				const modelLinks = document.querySelectorAll('a[href^="/models/"]');
				const allLinks = document.querySelectorAll('a');
				
				const models: string[] = [];
				const samples: Array<{ href: string | null; text: string }> = [];
				
				// Extract model IDs
				for (const link of modelLinks) {
					const href = link.getAttribute('href');
					if (href) {
						const modelId = href.replace('/models/', '');
						// Validate format: vendor/model-name
						if (modelId && modelId.includes('/') && !models.includes(modelId)) {
							models.push(modelId);
						}
					}
				}
				
				// Get sample of all links for debugging
				const linkArray = Array.from(allLinks);
				for (let i = 0; i < Math.min(5, linkArray.length); i++) {
					const link = linkArray[i];
					samples.push({
						href: link.getAttribute('href'),
						text: (link.textContent || '').substring(0, 50)
					});
				}
				
				return {
					models,
					totalLinks: allLinks.length,
					modelLinks: modelLinks.length,
					samples
				};
			});

			console.log(`[Scraping] Found ${modelData.modelLinks} model links in rendered page`);
			console.log(`[Scraping] Total links on page: ${modelData.totalLinks}`);
			console.log(`[Scraping] Extracted ${modelData.models.length} valid model IDs`);
			
			if (modelData.models.length > 0) {
				console.log(`[Scraping] First 3 models:`, modelData.models.slice(0, 3));
			} else {
				console.warn(`[Scraping] ⚠️  No valid model IDs extracted!`);
				console.log(`[Scraping] Sample of links found:`, JSON.stringify(modelData.samples, null, 2));
				
				// Capture screenshot for debugging
				try {
					const screenshot = await page.screenshot({ type: 'png', fullPage: false });
					console.log(`[Scraping] Screenshot captured, size: ${screenshot.length} bytes`);
					// In production, you might want to save this or log it differently
				} catch (screenshotError) {
					console.error(`[Scraping] Failed to capture screenshot:`, screenshotError);
				}
			}
			
			return modelData.models;
			
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error(`[Scraping] ❌ Error scraping from ${url}:`, error.message);
				console.error(`[Scraping] Error stack:`, error.stack);
			} else {
				console.error(`[Scraping] ❌ Unknown error scraping from ${url}`, error);
			}
			return [];
		} finally {
			// Close the page but keep browser alive for reuse
			if (page) {
				await page.close();
			}
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
