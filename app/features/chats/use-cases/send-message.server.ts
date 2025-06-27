import { ChatMessageRole } from "generated/prisma";
import { inject, injectable } from "inversify";
import { ChatRepository } from "../../chats/repositories/chat";
import { ChatService } from "../../chats/services/chat";
import { ChatMessage } from "../entities/chat-message";
import { ChatAggregate } from "../aggregates/chat-aggregate";

interface SendMessageInput {
	message: string;
	chatId: string | null;
}

export interface SendMessageResult {
	chatId: string;
}

@injectable()
export class SendMessageUseCase {
	constructor(
		@inject(ChatRepository)
		private readonly chatRepository: ChatRepository,
		@inject(ChatService)
		private readonly chatService: ChatService,
	) {}

	async execute(data: SendMessageInput): Promise<SendMessageResult> {
		const { message, chatId } = data;

		const userMessage = ChatMessage.create({
			content: { message },
			role: ChatMessageRole.user,
		});

		let chat = null;

		if (chatId) {
			chat = await this.chatRepository.findById(chatId, {
				messages: true,
			});
		}

		if (!chat) {
			chat = new ChatAggregate(await this.chatRepository.create(), []);
		}

		const assistantMessage = await this.chatService.getCompletions([
			...chat.messages,
			userMessage,
		]);

		await this.chatRepository.createChatMessages(
			chat.id,
			userMessage,
			assistantMessage,
		);

		return {
			chatId: chat.id,
		};
	}
}
