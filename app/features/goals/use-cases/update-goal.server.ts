import { inject, injectable } from "inversify";
import { UnitOfWork } from "~/features/core/services/unit-of-work";
import { GoalEmbedding } from "../entities/goal-embedding";
import { GoalRepository, type UpdateGoalInput } from "../repositories/goal";
import { GoalEmbeddingRepository } from "../repositories/goal-embedding";
import { GoalCacheService } from "../services/cache";
import { EmbeddingService } from "../services/embedding";

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
		@inject(UnitOfWork)
		private readonly uow: UnitOfWork,
	) {}

	async execute(
		goalId: string,
		goal: Omit<UpdateGoalInput, "updated_at" | "chat_message_id">,
	) {
		await this.uow.execute(async (tx) => {
			const transactionalGoalRepo = this.goalRepository.setTransaction(tx);
			const transactionalEmbeddingRepo =
				this.goalEmbeddingRepository.setTransaction(tx);

			const updatedGoal = await transactionalGoalRepo.updateById(goalId, {
				...goal,
				chat_message_id: null,
				updated_at: new Date(),
			});

			await transactionalEmbeddingRepo.deleteByGoalId(goalId);

			const markdown = updatedGoal.toMarkdown();

			const embeddings =
				await this.embeddingService.createEmbeddingsFromMarkdown(markdown);

			await transactionalEmbeddingRepo.createMany(
				embeddings.map((embedding) =>
					GoalEmbedding.create({
						goal_id: updatedGoal.id,
						embedding,
					}),
				),
			);

			await this.goalCacheService.invalidateAllSimilarGoals();
		});
	}
}
