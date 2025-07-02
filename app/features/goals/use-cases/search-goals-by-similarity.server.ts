import { inject, injectable } from "inversify";
import { GoalEmbeddingRepository } from "../repositories/goal-embedding";
import { EmbeddingService } from "../services/embedding";

export interface SearchGoalsBySimilarityParams {
	content: string;
	limit?: number;
	threshold?: number;
}

@injectable()
export class SearchGoalsBySimilarityUseCase {
	constructor(
		@inject(GoalEmbeddingRepository)
		private readonly goalEmbeddingRepository: GoalEmbeddingRepository,
		@inject(EmbeddingService)
		private readonly embeddingService: EmbeddingService,
	) {}

	async execute({
		content,
		limit = 6,
		threshold = 0.2,
	}: SearchGoalsBySimilarityParams) {
		const embedding =
			await this.embeddingService.createEmbeddingFromText(content);

		const goals = await this.goalEmbeddingRepository.findSimilar(
			embedding,
			undefined,
			limit,
			threshold,
		);

		return goals;
	}
}
