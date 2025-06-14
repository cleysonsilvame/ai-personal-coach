import { injectable, inject } from "inversify";
import { GoalRepository } from "../repositories/goal";
import { ChatMessagesMapper } from "~/features/chats/mappers/chat-messages";

interface SaveGoalFromMessageInput {
	messageId: string;
}

@injectable()
export class SaveGoalFromMessageUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
	) {}

	async execute({ messageId }: SaveGoalFromMessageInput) {
		const message = await this.goalRepository.findGoalByMessageId(messageId);
		if (!message) {
			throw new Error("Mensagem não encontrada");
		}

		const content = ChatMessagesMapper.toDomain(message);

		if (!content.data) {
			throw new Error("Conteúdo da mensagem não encontrado");
		}

		this.goalRepository.saveGoal({
			id: message.goal?.id,
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
