import { inject, injectable } from "inversify";
import type { SendMessageResult } from "~/features/goals/types";
import { ChatMessageRole } from "~/generated/prisma";
import { createChatMessages, getChatCompletions } from "~/services/chat.server";
import { ChatRepository } from "../repositories/chat";

interface SendMessageInput {
	message: string;
	chatId: string | null;
}

@injectable()
export class SendMessageUseCase {
	constructor(
		@inject(ChatRepository)
		private readonly chatRepository: ChatRepository,
	) {}

	async execute(data: SendMessageInput): Promise<SendMessageResult> {
		const { message, chatId } = data;

		const userMessage = {
			content: message,
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
			content: await getChatCompletions([...chat.messages, userMessage]),
			role: ChatMessageRole.assistant,
		};

		await createChatMessages(chat.id, userMessage, assistantMessage);

		return {
			chatId: chat.id,
		};
	}
}
