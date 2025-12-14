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
	isModelUnavailableError(error: any): boolean {
		if (!error) return false;

		const errorMessage = error?.message?.toLowerCase() || "";
		const errorStatus = error?.status;

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
