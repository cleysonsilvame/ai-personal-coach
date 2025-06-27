import { inject, injectable } from "inversify";
import type { Goal } from "../entities/goal";
import { GoalRepository, type UpdateGoalInput } from "../repositories/goal";

@injectable()
export class UpdateGoalUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
	) {}

	async execute(goalId: string, goal: Omit<UpdateGoalInput, "updated_at">) {
		return this.goalRepository.updateById(goalId, {
			...goal,
			updated_at: new Date(),
		});
	}
}
