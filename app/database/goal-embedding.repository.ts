import { inject, injectable } from "inversify";
import type { GoalEmbedding } from "~/features/goals/entities/goal-embedding";
import type { SimilarGoal } from "~/features/goals/entities/similar-goal";
import { GoalEmbeddingRepository } from "~/features/goals/repositories/goal-embedding";
import { PrismaClient } from "~/lib/prisma-client";
import { GoalEmbeddingMapper } from "~/features/goals/mappers/goal-embedding";

@injectable()
export class PrismaGoalEmbeddingRepository extends GoalEmbeddingRepository {
	constructor(
		@inject(PrismaClient) private readonly prismaClient: PrismaClient,
	) {
		super();
	}

	async createMany(embeddings: GoalEmbedding[]): Promise<void> {
		for (const e of embeddings) {
			await this.prismaClient.client.$executeRaw`
				INSERT INTO goal_embeddings (id, embedding, goal_id, created_at, updated_at)
				VALUES (${e.id}, ${JSON.stringify(e.embedding)}, ${e.goal_id}, ${e.created_at}, ${e.updated_at});
			`;
		}
	}

	async findSimilar(
		embedding: number[],
		excludeGoalId: string,
		limit = 5,
		cutOff = 0.7,
	): Promise<SimilarGoal[]> {
		const results = await this.prismaClient.client.$queryRaw<unknown[]>`
			SELECT
				g.id,
				g.title,
				g.description,
				(1 - vector_distance_cos(e.embedding, ${JSON.stringify(embedding)})) as similarity
			FROM goal_embeddings e
			JOIN goals g ON g.id = e.goal_id
			WHERE g.id != ${excludeGoalId} AND (1 - vector_distance_cos(e.embedding, ${JSON.stringify(embedding)})) > ${cutOff}
			ORDER BY similarity DESC
			LIMIT ${limit}
		`;

		return results.map(GoalEmbeddingMapper.toDomain);
	}
}
