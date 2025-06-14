import type { Goal } from "generated/prisma";
import { inject, injectable } from "inversify";
import { GoalRepository } from "../repositories/goal";

@injectable()
export class GetGoalsUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
	) {}

	async execute(): Promise<Goal[]> {
		const goals = await this.goalRepository.findAll();

		return goals;
	}
}
