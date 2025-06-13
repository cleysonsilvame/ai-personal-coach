import { inject, injectable } from "inversify";
import type { SendMessageResult } from "~/features/goals/types";
import { ChatMessageRole } from "generated/prisma";
import { ChatRepository } from "../repositories/chat";
import { ChatService } from "../services/chat";
import type { ChatMessageGetPayload } from "generated/prisma/models";

interface SendMessageInput {
	message: string;
	chatId: string | null;
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

		const userMessage = {
			content: JSON.stringify({ message }),
			role: ChatMessageRole.user,
		};

		let chat = null;

		if (chatId) {
			chat = await this.chatRepository.findById(chatId, {
				include: { messages: true },
			});
		}

		if (!chat) {
			chat = await this.chatRepository.create({
				include: { messages: true },
			});
		}

		const assistantMessage = {
			content: JSON.stringify(
				await this.chatService.getCompletions([...chat.messages, userMessage]),
			),
			role: ChatMessageRole.assistant,
		};

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
