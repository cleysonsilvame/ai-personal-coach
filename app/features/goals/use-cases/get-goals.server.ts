import type { GoalGetPayload } from "generated/prisma/models";
import { inject, injectable } from "inversify";
import { GoalRepository } from "../repositories/goal";

@injectable()
export class GetGoalsUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
	) {}

	async execute(): Promise<
		GoalGetPayload<{ include: { chat_message: true } }>[]
	> {
		const goals = await this.goalRepository.findAll();

		return goals;
	}
}
