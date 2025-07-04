import { inject, injectable } from "inversify";
import type { Goal } from "../entities/goal";
import type { SimilarGoal } from "../entities/similar-goal";
import { GoalRepository } from "../repositories/goal";
import { GoalEmbeddingRepository } from "../repositories/goal-embedding";
import { GoalCacheService } from "../services/cache";
import { EmbeddingService } from "../services/embedding";

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
			const embedding = await this.embeddingsService.createEmbeddingFromText(
				`${goal.title}: ${goal.description}`,
			);

			similarGoals = await this.goalsEmbeddingRepository.findSimilar(
				embedding,
				goalId,
				5,
			);

			await this.goalsCacheService.setSimilarGoals(goalId, similarGoals);
		}

		return { goal, similarGoals };
	}
}
