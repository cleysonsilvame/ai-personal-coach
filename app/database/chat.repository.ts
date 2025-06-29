import { inject } from "inversify";
import { ChatAggregate } from "~/features/chats/aggregates/chat-aggregate";
import { ChatMessageAggregate } from "~/features/chats/aggregates/chat-message-aggregate";
import type { Chat } from "~/features/chats/entities/chat";
import type { ChatMessage } from "~/features/chats/entities/chat-message";
import { ChatMapper } from "~/features/chats/mappers/chat";
import { ChatMessagesMapper } from "~/features/chats/mappers/chat-messages";
import {
	type ChatPayload,
	ChatRepository,
	type FindByIdInclude,
} from "~/features/chats/repositories/chat";
import type { Goal } from "~/features/goals/entities/goal";
import { GoalsMapper } from "~/features/goals/mappers/goals";
import { PrismaClient } from "~/lib/prisma-client";

type IncludeMessages = { include: { messages: boolean } };
type IncludeMessagesWithGoal = {
	include: { messages: { include: { goal: boolean } } };
};

type FindUniqueArgs = {
	where: { id: string };
} & (IncludeMessages | IncludeMessagesWithGoal);

export class PrismaChatRepository extends ChatRepository {
	constructor(@inject(PrismaClient) private readonly prisma: PrismaClient) {
		super();
	}

	async findById<T extends FindByIdInclude>(
		id: string,
		include: T,
	): Promise<
		| ChatAggregate<ChatMessageAggregate<Goal>[]>
		| ChatAggregate<ChatMessage[]>
		| ChatAggregate
		| null
	> {
		let prismaInclude: IncludeMessages | IncludeMessagesWithGoal;
		if (typeof include.messages === "boolean") {
			prismaInclude = {
				include: { messages: include.messages },
			} satisfies IncludeMessages;
		} else {
			prismaInclude = {
				include: { messages: { include: include.messages } },
			} satisfies IncludeMessagesWithGoal;
		}

		const prismaChat = await this.prisma.client.chat.findUnique<FindUniqueArgs>(
			Object.assign({ where: { id } }, prismaInclude),
		);

		if (!prismaChat) {
			return null;
		}

		const chat = ChatMapper.toDomain(prismaChat);

		if (include.messages && "messages" in prismaChat) {
			const messages = prismaChat.messages.map((message) => {
				const goal =
					"goal" in message && message.goal
						? GoalsMapper.toDomain(message.goal)
						: null;

				const chatMessage = ChatMessagesMapper.toDomain(message);

				return new ChatMessageAggregate(chatMessage, goal);
			});

			const chatAggregate = new ChatAggregate(chat, messages);
			return chatAggregate;
		}

		const chatAggregate = new ChatAggregate(chat);
		return chatAggregate;
	}

	async create(): Promise<Chat> {
		const chat = await this.prisma.client.chat.create({
			data: { title: "Sem título" },
		});

		return ChatMapper.toDomain(chat);
	}

	async updateById(id: string, data: { title?: string }): Promise<Chat> {
		const updatedChat = await this.prisma.client.chat.update({
			where: { id },
			data,
		});
		return ChatMapper.toDomain(updatedChat);
	}

	async createChatMessages(
		chatId: string,
		chatMessage: ChatMessage,
		answer: ChatMessage,
	): Promise<void> {
		await this.prisma.client.chatMessage.createMany({
			data: [
				{
					chat_id: chatId,
					content: JSON.stringify(chatMessage.content),
					role: chatMessage.role,
				},
				{
					chat_id: chatId,
					content: JSON.stringify(answer.content),
					role: answer.role,
				},
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

	async findAll(): Promise<Chat[]> {
		const chats = await this.prisma.client.chat.findMany();
		return chats.map(ChatMapper.toDomain);
	}
}
