import { inject, injectable } from "inversify";
import type { GetChatMessagesResult } from "~/features/goals/types";
import { ChatRepository } from "../../chats/repositories/chat";
import { ChatMessageRole } from "generated/prisma";
import { ChatMessagesMapper } from "../../chats/mappers/chat-messages";

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

		const messages = chat.messages.map(ChatMessagesMapper.toHtml);

		const lastMessage = messages[messages.length - 1];

		if (lastMessage.role !== ChatMessageRole.assistant)
			throw new Error("Last message is not an assistant message");

		return {
			messages,
			goal_id: lastMessage.goal?.id,
			message_id: lastMessage.id,
			goal_content: lastMessage.content.data,
			chat_title: chat.title,
		};
	}
}
