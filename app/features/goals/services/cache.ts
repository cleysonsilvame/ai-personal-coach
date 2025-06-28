import type { SimilarGoal } from "../entities/similar-goal";

export abstract class GoalCacheService {
	abstract getSimilarGoals(goalId: string): Promise<SimilarGoal[] | null>;
	abstract setSimilarGoals(
		goalId: string,
		value: SimilarGoal[],
		ttl?: number,
	): Promise<void>;
	abstract invalidateSimilarGoals(goalId: string): Promise<void>;
	abstract invalidateAllSimilarGoals(): Promise<void>;
}
