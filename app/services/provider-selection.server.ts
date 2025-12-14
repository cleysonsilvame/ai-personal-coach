import { injectable, inject } from "inversify";
import { Config } from "~/lib/config";

export interface ModelProvider {
	name: string;
	model: string;
}

/**
 * Service to manage model provider selection with fallback support
 * This allows the application to handle offline/unavailable models gracefully
 */
@injectable("Singleton")
export class ProviderSelectionService {
	constructor(@inject(Config) private readonly config: Config) {}

	/**
	 * Get the primary and fallback models for a specific use case
	 * Returns an array of models to try in order of preference
	 * 
	 * Note: The fallback mechanism uses the other model type as a backup
	 * (chat falls back to copilot model and vice versa). This provides
	 * resilience when a model is unavailable. While models may be optimized
	 * for different purposes, OpenRouter models are generally capable of
	 * handling various tasks. If you need strict separation, configure both
	 * models to the same value or implement custom fallback logic.
	 */
	getModelsForUseCase(useCase: "chat" | "copilot"): string[] {
		const primaryModel =
			useCase === "chat"
				? this.config.getChatModel()
				: this.config.getCopilotModel();

		const fallbackModel =
			useCase === "chat"
				? this.config.getCopilotModel()
				: this.config.getChatModel();

		// Return models in order of preference, removing duplicates
		const models = [primaryModel];
		if (fallbackModel && fallbackModel !== primaryModel) {
			models.push(fallbackModel);
		}

		return models;
	}

	/**
	 * Get all configured providers
	 */
	getProviders(): ModelProvider[] {
		const providers: ModelProvider[] = [];

		const chatModel = this.config.getChatModel();
		const copilotModel = this.config.getCopilotModel();

		providers.push({
			name: "chat",
			model: chatModel,
		});

		if (copilotModel !== chatModel) {
			providers.push({
				name: "copilot",
				model: copilotModel,
			});
		}

		return providers;
	}

	/**
	 * Check if an error indicates the model is unavailable
	 * This can be used to implement retry logic with fallback models
	 */
	isModelUnavailableError(error: unknown): boolean {
		if (!error) return false;

		const errorMessage = (error as Error)?.message?.toLowerCase() || "";
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
