import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/runtime";
import { inject, injectable } from "inversify";
import OpenAI from "openai";
import { SearchGoalsBySimilarityUseCase } from "~/features/goals/use-cases/search-goals-by-similarity.server";
import { Config } from "~/lib/config";

function getDescription(vercelUrl: string) {
	const urlTemplate = `${vercelUrl}/goal/view/<id>`;
	return `Quando o usuário perguntar sobre objetivos, realize uma busca vetorial para encontrá-los.
-	O conteúdo pode não estar no título ou descrição, mas estará no corpo do objetivo.
-	Retorne os dados completos e o link do objetivo.

Use o seguinte template em markdown para apresentar os resultados:
### [title](${urlTemplate})
> description
**Tempo estimado**: estimated_time
`;
}

@injectable("Singleton")
export class CopilotKitService {
	private readonly runtime: CopilotRuntime<
		[{ name: string; type: "string"; description: string }]
	>;
	private readonly serviceAdapter: OpenAIAdapter;

	constructor(
		@inject(Config) config: Config,
		@inject(SearchGoalsBySimilarityUseCase)
		private readonly searchGoalsBySimilarityUseCase: SearchGoalsBySimilarityUseCase,
	) {
		const openRouterClient = new OpenAI({
			apiKey: config.env.OPEN_ROUTER_API_KEY,
			baseURL: config.env.OPEN_ROUTER_BASE_URL,
		});

		this.serviceAdapter = new OpenAIAdapter({
			openai: openRouterClient,
			model: config.env.OPEN_ROUTER_MODEL,
		});

		this.runtime = new CopilotRuntime({
			actions: () => [
				{
					name: "get_vector_search_goals",
					description: getDescription(config.env.VERCEL_URL),
					parameters: [
						{
							name: "content",
							type: "string",
							description: "O contexto para se fazer a busca por similaridade",
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
	}

	execute() {
		return {
			runtime: this.runtime,
			serviceAdapter: this.serviceAdapter,
		};
	}
}
