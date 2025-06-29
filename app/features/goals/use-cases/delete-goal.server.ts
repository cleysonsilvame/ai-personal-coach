import { inject, injectable } from "inversify";
import { UnitOfWork } from "~/features/core/services/unit-of-work";
import { GoalRepository } from "../repositories/goal";
import { GoalCacheService } from "../services/cache";

@injectable()
export class DeleteGoalUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
		@inject(GoalCacheService)
		private readonly goalCacheService: GoalCacheService,
		@inject(UnitOfWork)
		private readonly uow: UnitOfWork,
	) {}

	async execute(goalId: string): Promise<void> {
		await this.uow.execute(async (tx) => {
			const transactionalGoalRepo = this.goalRepository.setTransaction(tx);
			await transactionalGoalRepo.deleteById(goalId);
			await this.goalCacheService.invalidateAllSimilarGoals();
		});
	}
}
