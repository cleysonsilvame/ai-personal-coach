import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/runtime";
import { inject, injectable } from "inversify";
import OpenAI from "openai";
import { SearchGoalsBySimilarityUseCase } from "~/features/goals/use-cases/search-goals-by-similarity.server";
import { Config } from "~/lib/config";
import { Logger } from "~/lib/logger";
import { ProviderSelectionService } from "./provider-selection.server";

function getDescription() {
	const urlTemplate = "/goals/view/<id>";
	return `Quando o usuário perguntar sobre objetivos, realize uma busca vetorial para encontrá-los.
-O conteúdo pode não estar no título ou descrição, mas estará no corpo do objetivo.
-Retorne os dados completos e o link do objetivo.

Use o seguinte template em markdown para apresentar os resultados:
**[title](${urlTemplate})**
> description
**Tempo estimado**: estimated_time
`;
}

@injectable("Singleton")
export class CopilotKitService {
	private runtime: CopilotRuntime<
		[{ name: string; type: "string"; description: string }]
	> | null = null;
	private serviceAdapter: OpenAIAdapter | null = null;
	private initPromise: Promise<void> | null = null;

	constructor(
		@inject(Config) private readonly config: Config,
		@inject(Logger) private readonly logger: Logger,
		@inject(ProviderSelectionService)
		private readonly providerSelection: ProviderSelectionService,
		@inject(SearchGoalsBySimilarityUseCase)
		private readonly searchGoalsBySimilarityUseCase: SearchGoalsBySimilarityUseCase,
	) {}

	private async initialize(): Promise<void> {
		try {
			const model = await this.providerSelection.getCopilotModel();
			this.logger.info(
				`[CopilotKit] Initializing runtime with model: ${model}`,
			);

			const openRouterClient = new OpenAI({
				apiKey: this.config.env.OPEN_ROUTER_API_KEY,
				baseURL: this.config.env.OPEN_ROUTER_BASE_URL,
			});

			this.serviceAdapter = new OpenAIAdapter({
				openai: openRouterClient,
				model,
			});

			this.runtime = new CopilotRuntime({
				actions: () => [
					{
						name: "get_vector_search_goals",
						description: getDescription(),
						parameters: [
							{
								name: "content",
								type: "string",
								description:
									"O contexto para se fazer a busca por similaridade",
							},
						],
						handler: async ({ content }) => {
							const goals = await this.searchGoalsBySimilarityUseCase.execute({
								content,
							});

							return goals;
						},
					},
				],
			});
		} catch (error) {
			this.logger.error("[CopilotKit] Failed to initialize service", error);
			throw new Error(
				`CopilotKit initialization failed: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	async execute() {
		if (!this.runtime || !this.serviceAdapter) {
			if (!this.initPromise) {
				this.initPromise = this.initialize();
			}
			await this.initPromise;
		}

		if (!this.runtime) {
			throw new Error("CopilotKit runtime not initialized");
		}
		if (!this.serviceAdapter) {
			throw new Error("CopilotKit service adapter not initialized");
		}

		return {
			runtime: this.runtime,
			serviceAdapter: this.serviceAdapter,
		};
	}
}
