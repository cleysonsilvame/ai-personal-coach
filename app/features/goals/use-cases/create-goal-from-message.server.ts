import { injectable, inject } from "inversify";
import { GoalRepository } from "../repositories/goal";
import { ChatMessagesMapper } from "~/features/chats/mappers/chat-messages";
import { Goal } from "../entities/goal";

interface CreateGoalFromMessageInput {
	messageId: string;
}

@injectable()
export class CreateGoalFromMessageUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
	) {}

	async execute({ messageId }: CreateGoalFromMessageInput) {
		const message = await this.goalRepository.findGoalByMessageId(messageId);
		if (!message) {
			throw new Error("Mensagem não encontrada");
		}

		const content = ChatMessagesMapper.toDomain(message);

		if (!content.data) {
			throw new Error("Conteúdo da mensagem não encontrado");
		}

		const goal = Goal.create({
			title: content.data.title,
			description: content.data.description,
			estimated_time: content.data.estimated_time,
			action_steps: content.data.action_steps,
			progress_indicators: content.data.progress_indicators,
			suggested_habits: content.data.suggested_habits,
			motivation_strategies: content.data.motivation_strategies,
			chat_message_id: message.id,
		});

		const createdGoal = await this.goalRepository.createGoal(goal);

		console.log(createdGoal);

		// TODO: create markdown from goal data
	}
}
