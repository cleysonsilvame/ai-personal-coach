import { inject, injectable } from "inversify";
import type { SimilarGoal } from "~/features/goals/entities/similar-goal";
import type { GoalCacheService } from "~/features/goals/services/cache";
import { RedisClient } from "~/lib/redis-client";

@injectable()
export class RedisGoalCacheService implements GoalCacheService {
	private readonly TTL = 60 * 60 * 24 * 30; // 30 days

	constructor(@inject(RedisClient) private readonly redis: RedisClient) {}

	async getSimilarGoals(goalId: string): Promise<SimilarGoal[] | null> {
		const value = await this.redis.get(goalId);
		return value ? JSON.parse(value) : null;
	}

	async setSimilarGoals(goalId: string, value: SimilarGoal[]): Promise<void> {
		await this.redis.set(goalId, JSON.stringify(value), "EX", this.TTL);
	}
}
