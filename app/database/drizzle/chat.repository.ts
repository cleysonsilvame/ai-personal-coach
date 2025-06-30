import type { Prisma } from "generated/prisma";
import { ChatAggregate } from "~/features/chats/aggregates/chat-aggregate";
import { ChatMessageAggregate } from "~/features/chats/aggregates/chat-message-aggregate";
import type { Chat } from "~/features/chats/entities/chat";
import type { ChatMessage } from "~/features/chats/entities/chat-message";
import { ChatMapper } from "~/features/chats/mappers/chat";
import { ChatMessagesMapper } from "~/features/chats/mappers/chat-messages";
import type {
	ChatRepository,
	FindByIdInclude,
} from "~/features/chats/repositories/chat";
import type { Goal } from "~/features/goals/entities/goal";
import { GoalsMapper } from "~/features/goals/mappers/goals";
import { BaseDrizzleRepository } from "./base.repository";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import type { TablesRelationalConfig } from "drizzle-orm";
import {
	chatsTable,
	chatMessagesTable,
	goalsTable,
	goalEmbeddingsTable,
} from "drizzle/schema";
import { eq, sql } from "drizzle-orm";

export class DrizzleChatRepository
	extends BaseDrizzleRepository
	implements ChatRepository
{
	setTransaction(
		tx: SQLiteTransaction<
			"async",
			unknown,
			Record<string, unknown>,
			TablesRelationalConfig
		>,
	): ChatRepository {
		return new DrizzleChatRepository(tx);
	}

	async findById<T extends FindByIdInclude>(
		id: string,
		include?: T,
	): Promise<
		| ChatAggregate
		| ChatAggregate<ChatMessage[]>
		| ChatAggregate<ChatMessageAggregate<Goal>[]>
		| null
	> {
		const includeMessages = Boolean(include?.messages);
		const includeMessagesGoal = Boolean(
			typeof include?.messages === "object" && include?.messages.goal,
		);

		let baseQuery = null;

		baseQuery = this.drizzle.client
			.select({
				chats: chatsTable,
				chat_messages: includeMessages ? chatMessagesTable : sql<null>`NULL`, // TODO: buscar outra forma de fazer isso
				goals: includeMessagesGoal ? goalsTable : sql<null>`NULL`,
			})
			.from(chatsTable)
			.where(eq(chatsTable.id, id));

		if (includeMessages) {
			baseQuery = baseQuery.leftJoin(
				chatMessagesTable,
				eq(chatMessagesTable.chat_id, chatsTable.id),
			);

			if (includeMessagesGoal) {
				baseQuery = baseQuery.leftJoin(
					goalsTable,
					eq(goalsTable.id, chatMessagesTable.goal_id),
				);
			}
		}

		const results = await baseQuery;

		if (!results.length) return null;

		const chat = ChatMapper.toDomain(results[0].chats);

		const messages = results
			.map(({ chat_messages, goals }) => {
				if (!chat_messages) return null;

				return new ChatMessageAggregate(
					ChatMessagesMapper.toDomain(chat_messages),
					goals ? GoalsMapper.toDomain(goals) : null,
				);
			})
			.filter((msg) => msg !== null);

		return new ChatAggregate(chat, messages);
	}

	async create(): Promise<Chat> {
		const defaultTitle = "Sem título";
		const [chat] = await this.drizzle.client
			.insert(chatsTable)
			.values({ title: defaultTitle })
			.returning();

		return ChatMapper.toDomain(chat);
	}

	async updateById(id: string, data: { title?: string }): Promise<Chat> {
		const updatedChat = await this.drizzle.client
			.update(chatsTable)
			.set(data)
			.where(eq(chatsTable.id, id))
			.returning();

		return ChatMapper.toDomain(updatedChat[0]);
	}

	async createChatMessages(
		chatId: string,
		chatMessage: ChatMessage,
		answer: ChatMessage,
	): Promise<void> {
		await this.drizzle.client.insert(chatMessagesTable).values([
			{
				chat_id: chatId,
				content: chatMessage.content,
				role: chatMessage.role,
			},
			{ chat_id: chatId, content: answer.content, role: answer.role },
		]);
	}

	async deleteChat(chatId: string) {
		await this.drizzle.client.transaction(async (tx) => {
			await tx
				.delete(chatMessagesTable)
				.where(eq(chatMessagesTable.chat_id, chatId));
			await tx.delete(chatsTable).where(eq(chatsTable.id, chatId));
		});
	}

	async findAll(): Promise<Chat[]> {
		const chats = await this.drizzle.client.select().from(chatsTable);

		return chats.map(ChatMapper.toDomain);
	}
}
