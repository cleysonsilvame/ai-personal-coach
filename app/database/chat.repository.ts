import { ChatRepository } from "~/features/chats/repositories/chat";
import type { SelectSubset } from "generated/prisma/internal/prismaNamespace";
import type {
	ChatCreateArgs,
	ChatDefaultArgs,
	ChatFindUniqueArgs,
} from "generated/prisma/models";
import type { ChatMessageRole } from "generated/prisma";
import { inject } from "inversify";
import { PrismaClient } from "~/lib/prisma-client";

export class PrismaChatRepository extends ChatRepository {
	constructor(@inject(PrismaClient) private readonly prisma: PrismaClient) {
		super();
	}

	async findById<T extends ChatDefaultArgs>(
		id: string,
		options?: SelectSubset<T, ChatDefaultArgs>,
	) {
		const args = { where: { id } } satisfies ChatFindUniqueArgs;

		const chat = await this.prisma.client.chat.findUnique<T & typeof args>(
			Object.assign(args, options),
		);

		return chat;
	}

	async create<T extends ChatDefaultArgs>(
		options?: SelectSubset<T, ChatDefaultArgs>,
	) {
		const args = { data: { title: "Sem título" } } satisfies ChatCreateArgs;

		const chat = await this.prisma.client.chat.create<T & typeof args>(
			Object.assign(args, options),
		);

		return chat;
	}

	async update(id: string, title: string): Promise<void> {
		await this.prisma.client.chat.update({
			where: { id },
			data: { title },
		});
	}

	async createChatMessages(
		chatId: string,
		chatMessage: { content: string; role: ChatMessageRole },
		answer: { content: string; role: ChatMessageRole },
	): Promise<void> {
		await this.prisma.client.chatMessage.createMany({
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
		await this.prisma.client.chatMessage.deleteMany({
			where: {
				chat_id: chatId,
			},
		});

		await this.prisma.client.chat.delete({
			where: {
				id: chatId,
			},
		});
	}

	async findAll() {
		const chats = await this.prisma.client.chat.findMany();
		return chats;
	}
}
