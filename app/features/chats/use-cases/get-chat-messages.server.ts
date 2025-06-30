import { inject, injectable } from "inversify";
import { ChatMessagesMapper } from "../../chats/mappers/chat-messages";
import { ChatRepository } from "../../chats/repositories/chat";
import type { ChatMessage, ChatMessageContent } from "../entities/chat-message";

export interface GetChatMessagesResult {
	messages: ChatMessage[];
	goal_id?: string;
	message_id?: string;
	goal_content?: ChatMessageContent["data"];
	chat_title?: string;
}

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
			messages: { goal: true },
		});

		if (!chat) {
			return { messages: [] };
		}

		const messages = chat.messages.map(ChatMessagesMapper.toHtml);

		const lastMessage = messages[messages.length - 1];

		if (lastMessage?.role !== "assistant")
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
