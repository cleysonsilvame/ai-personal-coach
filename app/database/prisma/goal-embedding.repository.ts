import type { Prisma } from "generated/prisma";
import { injectable } from "inversify";
import type { GoalEmbedding } from "~/features/goals/entities/goal-embedding";
import type { SimilarGoal } from "~/features/goals/entities/similar-goal";
import { GoalEmbeddingMapper } from "~/features/goals/mappers/goal-embedding";
import type { GoalEmbeddingRepository } from "~/features/goals/repositories/goal-embedding";
import { BasePrismaRepository } from "./base.repository";

@injectable()
export class PrismaGoalEmbeddingRepository
	extends BasePrismaRepository
	implements GoalEmbeddingRepository
{
	setTransaction(tx: Prisma.TransactionClient) {
		return new PrismaGoalEmbeddingRepository(tx);
	}

	async createMany(embeddings: GoalEmbedding[]): Promise<void> {
		for (const e of embeddings) {
			await this.prisma.client.$executeRaw`
				INSERT INTO goal_embeddings (id, embedding, goal_id, created_at, updated_at)
				VALUES (${e.id}, ${JSON.stringify(e.embedding)}, ${e.goal_id}, ${e.created_at}, ${e.updated_at});
			`;
		}
	}

	async deleteByGoalId(goalId: string): Promise<void> {
		await this.prisma.client.$executeRaw`
			DELETE FROM goal_embeddings WHERE goal_id = ${goalId};
		`;
	}

	async findSimilar(
		embedding: number[],
		excludeGoalId: string,
		limit = 3,
		cutOff = 0.65,
	): Promise<SimilarGoal[]> {
		const results = await this.prisma.client.$queryRaw<unknown[]>`
			SELECT
				g.id,
				g.title,
				g.description,
				g.estimated_time,
				(1 - vector_distance_cos(e.embedding, vector32(${JSON.stringify(embedding)}))) as similarity
			FROM goal_embeddings e
			JOIN goals g ON g.id = e.goal_id
			WHERE g.id != ${excludeGoalId} AND similarity > ${cutOff}
			ORDER BY similarity DESC
			LIMIT ${limit}
		`;

		return results.map(GoalEmbeddingMapper.toDomain);
	}
}
