import { inject, injectable } from "inversify";
import { GoalRepository } from "../repositories/goal";
import type { Goal } from "../entities/goal";
import { GoalCacheService } from "../services/cache";
import type { SimilarGoal } from "../entities/similar-goal";
import type { EmbeddingService } from "../services/embedding";
import type { GoalEmbeddingRepository } from "../repositories/goal-embedding";

interface GetGoalsByIdOutput {
	goal: Goal;
	similarGoals: SimilarGoal[];
}

@injectable()
export class GetGoalByIdUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
		@inject(GoalCacheService)
		private readonly goalsCacheService: GoalCacheService,
		private readonly embeddingsService: EmbeddingService,
		private readonly goalsEmbeddingRepository: GoalEmbeddingRepository,
	) {}

	async execute(goalId: string): Promise<GetGoalsByIdOutput> {
		const goal = await this.goalRepository.findById(goalId);

		if (!goal) {
			throw new Error("Goal not found");
		}

		let similarGoals = await this.goalsCacheService.getSimilarGoals(goalId);

		if (!similarGoals) {
			const embedding = await this.embeddingsService.createEmbeddingFromTitle(
				goal.title,
			);

			similarGoals = await this.goalsEmbeddingRepository.findSimilar(
				embedding,
				goalId,
				4,
			);

			await this.goalsCacheService.setSimilarGoals(goalId, similarGoals);
		}

		return { goal, similarGoals };
	}
}
