import { inject, injectable } from "inversify";
import { GoalEmbedding } from "../entities/goal-embedding";
import { GoalRepository, type UpdateGoalInput } from "../repositories/goal";
import { GoalEmbeddingRepository } from "../repositories/goal-embedding";
import { EmbeddingService } from "../services/embedding";
import { GoalCacheService } from "../services/cache";

@injectable()
export class UpdateGoalUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
		@inject(GoalEmbeddingRepository)
		private readonly goalEmbeddingRepository: GoalEmbeddingRepository,
		@inject(EmbeddingService)
		private readonly embeddingService: EmbeddingService,
		@inject(GoalCacheService)
		private readonly goalCacheService: GoalCacheService,
	) {}

	async execute(goalId: string, goal: Omit<UpdateGoalInput, "updated_at">) {
		const updatedGoal = await this.goalRepository.updateById(goalId, {
			...goal,
			updated_at: new Date(),
		});

		await this.goalEmbeddingRepository.deleteByGoalId(goalId);

		const markdown = updatedGoal.toMarkdown();

		const embeddings =
			await this.embeddingService.createEmbeddingsFromMarkdown(markdown);

		await this.goalEmbeddingRepository.createMany(
			embeddings.map((e) =>
				GoalEmbedding.create({
					goal_id: updatedGoal.id,
					embedding: e.embedding,
				}),
			),
		);

		await this.goalCacheService.invalidateAllSimilarGoals();

		return updatedGoal;
	}
}
