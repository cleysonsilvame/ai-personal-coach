import type { GoalEmbedding } from "../entities/goal-embedding";

export abstract class GoalEmbeddingRepository {
	abstract createMany(embeddings: GoalEmbedding[]): Promise<void>;
}
