import { and, desc, eq, gt, ne, sql } from "drizzle-orm";
import { goalEmbeddingsTable, goalsTable } from "drizzle/schema";
import type { GoalEmbedding } from "~/features/goals/entities/goal-embedding";
import type { SimilarGoal } from "~/features/goals/entities/similar-goal";
import { GoalEmbeddingMapper } from "~/features/goals/mappers/goal-embedding";
import type { GoalEmbeddingRepository } from "~/features/goals/repositories/goal-embedding";
import {
	BaseDrizzleRepository,
	type DrizzleTransaction,
} from "./base.repository";

export class DrizzleGoalEmbeddingRepository
	extends BaseDrizzleRepository
	implements GoalEmbeddingRepository
{
	setTransaction(tx: DrizzleTransaction): GoalEmbeddingRepository {
		return new DrizzleGoalEmbeddingRepository(tx);
	}

	async createMany(embeddings: GoalEmbedding[]): Promise<void> {
		for (const e of embeddings) {
			await this.drizzle.client.insert(goalEmbeddingsTable).values({
				id: e.id,
				embedding: e.embedding,
				goal_id: e.goal_id,
				created_at: e.created_at,
				updated_at: e.updated_at,
			});
		}
	}

	async deleteByGoalId(goalId: string): Promise<void> {
		await this.drizzle.client
			.delete(goalEmbeddingsTable)
			.where(eq(goalEmbeddingsTable.goal_id, goalId));
	}

	async findSimilar(
		embedding: number[],
		excludeGoalId: string,
		limit = 3,
		cutOff = 0.65,
	): Promise<SimilarGoal[]> {
		const similarity = sql<number>`1 - vector_distance_cos(${goalEmbeddingsTable.embedding}, vector32(${JSON.stringify(embedding)}))`;

		const results = await this.drizzle.client
			.select({
				id: goalsTable.id,
				title: goalsTable.title,
				description: goalsTable.description,
				estimated_time: goalsTable.estimated_time,
				similarity,
			})
			.from(goalEmbeddingsTable)
			.innerJoin(goalsTable, eq(goalsTable.id, goalEmbeddingsTable.goal_id))
			.where(and(ne(goalsTable.id, excludeGoalId), gt(similarity, cutOff)))
			.orderBy(desc(similarity))
			.limit(limit);

		return results.map(GoalEmbeddingMapper.toDomain);
	}
}
