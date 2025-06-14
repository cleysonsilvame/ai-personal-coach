import { inject, injectable } from "inversify";
import { GoalRepository } from "../repositories/goal";
import type { GoalUpdateInput } from "generated/prisma/models/Goal";

@injectable()
export class UpdateGoalUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
	) {}

	async execute<T extends Omit<GoalUpdateInput, "id">>(
		goalId: string,
		data: T,
	) {
		return this.goalRepository.updateById(goalId, data);
	}
}
