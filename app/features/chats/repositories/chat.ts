import type { Goal } from "~/features/goals/entities/goal";
import type { ChatAggregate } from "../aggregates/chat-aggregate";
import type { ChatMessageAggregate } from "../aggregates/chat-message-aggregate";
import type { Chat } from "../entities/chat";
import type { ChatMessage } from "../entities/chat-message";
import type { Transaction } from "~/features/core/services/transaction";

export type FindByIdInclude = {
	messages: boolean | { goal: boolean };
};

export type ChatPayload<T extends FindByIdInclude> = T extends {
	messages: true;
}
	? ChatAggregate<ChatMessage[]>
	: T extends { messages: { goal: true } }
		? ChatAggregate<ChatMessageAggregate<Goal>[]>
		: ChatAggregate;

export abstract class ChatRepository {
	abstract setTransaction(tx: Transaction): ChatRepository;

	abstract findById<T extends FindByIdInclude>(
		id: string,
		include?: T,
	): Promise<ChatPayload<T> | null>;
	abstract findById<T extends FindByIdInclude>(
		id: string,
		include?: T,
	): Promise<
		| ChatAggregate
		| ChatAggregate<ChatMessage[]>
		| ChatAggregate<ChatMessageAggregate<Goal>[]>
		| null
	>;

	abstract create(): Promise<Chat>;

	abstract updateById(id: string, data: { title?: string }): Promise<Chat>;

	abstract createChatMessages(
		chatId: string,
		chatMessage: ChatMessage,
		answer: ChatMessage,
	): Promise<void>;

	abstract deleteChat(chatId: string): Promise<void>;

	abstract findAll(): Promise<Chat[]>;
}
