import type { GoalGetPayload } from "generated/prisma/models";
import { inject, injectable } from "inversify";
import { GoalRepository } from "../repositories/goal";
import type { GoalAggregate } from "../aggregates/goal-aggregate";
import type { ChatMessage } from "~/features/chats/entities/chat-message";

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
