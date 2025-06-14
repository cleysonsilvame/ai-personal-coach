import { injectable, inject } from "inversify";
import { GoalRepository } from "../repositories/goal";
import { ChatMessagesMapper } from "~/features/chats/mappers/chat-messages";

interface CreateOrUpdateGoalFromMessageInput {
	messageId: string;
	goalId?: string;
}

@injectable()
export class SaveGoalFromMessageUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
	) {}

	async execute({ messageId, goalId }: CreateOrUpdateGoalFromMessageInput) {
		const message = await this.goalRepository.findGoalByMessageId(messageId);
		if (!message) {
			throw new Error("Mensagem não encontrada");
		}

		const content = ChatMessagesMapper.toDomain(message);

		if (message.goal) {
			throw new Error("Objetivo já existe");
		}

		if (!content.data) {
			throw new Error("Conteúdo da mensagem não encontrado");
		}

		this.goalRepository.createGoal({
			title: content.data.title,
			description: content.data.description,
			estimated_time: content.data.estimated_time,
			action_steps: content.data.action_steps,
			progress_indicators: content.data.progress_indicators,
			suggested_habits: content.data.suggested_habits,
			motivation_strategies: content.data.motivation_strategies,
			chat_message: { connect: { id: messageId } },
		});
	}
}
