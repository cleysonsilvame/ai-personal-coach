import { prisma } from "~/lib/prisma-client";
import { ChatRepository } from "~/features/goals/repositories/chat";
import type { SelectSubset } from "generated/prisma/internal/prismaNamespace";
import type {
	ChatCreateArgs,
	ChatDefaultArgs,
	ChatFindUniqueArgs,
} from "generated/prisma/models";
import type { ChatMessageRole } from "generated/prisma";

export class PrismaChatRepository extends ChatRepository {
	async findById<T extends ChatDefaultArgs>(
		id: string,
		options?: SelectSubset<T, ChatDefaultArgs>,
	) {
		const args = { where: { id } } satisfies ChatFindUniqueArgs;

		const chat = await prisma.chat.findUnique<T & typeof args>(
			Object.assign(args, options),
		);

		return chat;
	}

	async create<T extends ChatDefaultArgs>(
		options?: SelectSubset<T, ChatDefaultArgs>,
	) {
		const args = { data: {} } satisfies ChatCreateArgs;

		const chat = await prisma.chat.create<T & typeof args>(
			Object.assign(args, options),
		);

		return chat;
	}

	async update(id: string, title: string): Promise<void> {
		await prisma.chat.update({
			where: { id },
			data: { title },
		});
	}

	async createChatMessages(
		chatId: string,
		chatMessage: { content: string; role: ChatMessageRole },
		answer: { content: string; role: ChatMessageRole },
	): Promise<void> {
		await prisma.chatMessage.createMany({
			data: [
				{
					chat_id: chatId,
					...chatMessage,
				},
				{ chat_id: chatId, ...answer },
			],
		});
	}

	async deleteChat(chatId: string) {
		await prisma.chat.delete({
			where: {
				id: chatId,
			},
			include: {
				messages: true,
			},
		});
	}
}
