import { inject, injectable } from "inversify";
import { GoalRepository } from "../repositories/goal";

@injectable()
export class DeleteGoalUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
	) {}

	async execute(goalId: string): Promise<void> {
		await this.goalRepository.deleteById(goalId);
		// TODO: delete cache
	}
}
