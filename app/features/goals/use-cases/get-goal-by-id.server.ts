import type { Goal } from "generated/prisma";
import { inject, injectable } from "inversify";
import { GoalRepository } from "../repositories/goal";

@injectable()
export class GetGoalByIdUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
	) {}

	async execute(goalId: string): Promise<Goal> {
		const goal = await this.goalRepository.findById(goalId);

		if (!goal) {
			throw new Error("Goal not found");
		}

		// const similarGoals = await findSimilarGoals(goal.title, 4);

		return goal;
	}
}
