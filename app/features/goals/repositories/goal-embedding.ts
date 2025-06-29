import type { Prisma } from "generated/prisma";
import type { GoalEmbedding } from "../entities/goal-embedding";
import type { SimilarGoal } from "../entities/similar-goal";

export abstract class GoalEmbeddingRepository {
	abstract setTransaction(
		tx: Prisma.TransactionClient,
	): GoalEmbeddingRepository;
	abstract createMany(embeddings: GoalEmbedding[]): Promise<void>;
	abstract deleteByGoalId(goalId: string): Promise<void>;
	abstract findSimilar(
		embedding: number[],
		excludeGoalId: string,
		limit?: number,
		cutOff?: number,
	): Promise<SimilarGoal[]>;
}
