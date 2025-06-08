import { inject, injectable } from "inversify";
import type {
	GetChatMessagesResult,
	MappedMessage,
} from "~/features/goals/types";
import { ChatRepository } from "../repositories/chat";
import { ChatMessageRole } from "generated/prisma";

@injectable()
export class GetChatMessagesUseCase {
	constructor(
		@inject(ChatRepository)
		private readonly chatRepository: ChatRepository,
	) {}

	async execute(chatId: string | null): Promise<GetChatMessagesResult> {
		if (!chatId) {
			return { messages: [] };
		}

		const chat = await this.chatRepository.findById(chatId, {
			include: { messages: { include: { goal: true } } },
		});

		if (!chat) {
			return { messages: [] };
		}

		const messages: MappedMessage[] = chat.messages.map((message) => {
			if (message.role === ChatMessageRole.assistant) {
				const goal_content = JSON.parse(message.content);
				return {
					...message,
					content: goal_content.assistant_message,
					goal_content,
				};
			}

			return message;
		});

		const lastMessage = messages[messages.length - 1];

		if (lastMessage.role !== ChatMessageRole.assistant)
			throw new Error("Last message is not an assistant message");

		return {
			messages,
			goal_id: lastMessage.goal?.id,
			message_id: lastMessage.id,
			goal_content: lastMessage.goal_content,
		};
	}
}
