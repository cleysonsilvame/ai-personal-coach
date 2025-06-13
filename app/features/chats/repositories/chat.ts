import type { SelectSubset } from "generated/prisma/internal/prismaNamespace";
import type { ChatDefaultArgs, ChatGetPayload } from "generated/prisma/models";
import type { Chat, ChatMessageRole } from "generated/prisma";

export abstract class ChatRepository {
	abstract findById<T extends ChatDefaultArgs>(
		id: string,
		options?: SelectSubset<T, ChatDefaultArgs>,
	): Promise<ChatGetPayload<T & { where: { id: string } }> | null>;

	abstract create<T extends ChatDefaultArgs>(
		options?: SelectSubset<T, ChatDefaultArgs>,
	): Promise<ChatGetPayload<T & { data: object }>>;

	abstract update(id: string, title: string): Promise<void>;

	abstract createChatMessages(
		chatId: string,
		chatMessage: { content: string; role: ChatMessageRole },
		answer: { content: string; role: ChatMessageRole },
	): Promise<void>;

	abstract deleteChat(chatId: string): Promise<void>;

	abstract findAll(): Promise<Chat[]>;
}
