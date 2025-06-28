import { inject, injectable } from "inversify";
import type { GoalEmbedding } from "~/features/goals/entities/goal-embedding";
import { GoalEmbeddingRepository } from "~/features/goals/repositories/goal-embedding";
import { PrismaClient } from "~/lib/prisma-client";

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
}
