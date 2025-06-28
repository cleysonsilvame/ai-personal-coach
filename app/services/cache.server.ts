import { inject, injectable } from "inversify";
import type { SimilarGoal } from "~/features/goals/entities/similar-goal";
import type { GoalCacheService } from "~/features/goals/services/cache";
import { RedisClient } from "~/lib/redis-client";

@injectable()
export class RedisGoalCacheService implements GoalCacheService {
	private readonly TTL = 60 * 60 * 24 * 30; // 30 days
	private readonly PREFIX = "similar_goals:";

	constructor(@inject(RedisClient) private readonly redis: RedisClient) {}

	private getKey(goalId: string) {
		return `${this.PREFIX}${goalId}`;
	}

	async getSimilarGoals(goalId: string): Promise<SimilarGoal[] | null> {
		const value = await this.redis.get(this.getKey(goalId));
		return value ? JSON.parse(value) : null;
	}

	async setSimilarGoals(
		goalId: string,
		value: SimilarGoal[],
		ttl?: number,
	): Promise<void> {
		await this.redis.set(
			this.getKey(goalId),
			JSON.stringify(value),
			"EX",
			ttl ?? this.TTL,
		);
	}

	async invalidateSimilarGoals(goalId: string): Promise<void> {
		await this.redis.del(this.getKey(goalId));
	}

	async invalidateAllSimilarGoals(): Promise<void> {
		const keys = await this.redis.keys(`${this.PREFIX}*`);
		if (keys.length > 0) {
			await this.redis.del(keys);
		}
	}
}
