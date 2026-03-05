import { inject, injectable } from "inversify";
import type { ChatMessage } from "~/features/chats/entities/chat-message";
import type { GoalAggregate } from "../aggregates/goal-aggregate";
import { GoalRepository } from "../repositories/goal";

@injectable()
export class GetGoalsUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
	) {}

	async execute(): Promise<GoalAggregate<ChatMessage | null>[]> {
		const goals = await this.goalRepository.findAll({ chatMessage: true });

		return goals;
	}
}
