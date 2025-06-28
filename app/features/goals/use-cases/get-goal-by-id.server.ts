import { inject, injectable } from "inversify";
import { GoalRepository } from "../repositories/goal";
import type { Goal } from "../entities/goal";
import { GoalCacheService } from "../services/cache";
import type { SimilarGoal } from "../entities/similar-goal";
import { EmbeddingService } from "../services/embedding";
import { GoalEmbeddingRepository } from "../repositories/goal-embedding";

interface GetGoalsByIdOutput {
	goal: Goal;
	similarGoals: SimilarGoal[] | null;
}

@injectable()
export class GetGoalByIdUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
		@inject(GoalCacheService)
		private readonly goalsCacheService: GoalCacheService,
		@inject(EmbeddingService)
		private readonly embeddingsService: EmbeddingService,
		@inject(GoalEmbeddingRepository)
		private readonly goalsEmbeddingRepository: GoalEmbeddingRepository,
	) {}

	async execute(goalId: string, similar = false): Promise<GetGoalsByIdOutput> {
		const goal = await this.goalRepository.findById(goalId);

		if (!goal) {
			throw new Error("Goal not found");
		}

		if (!similar) {
			return { goal, similarGoals: null };
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
