import { eq } from "drizzle-orm";
import { chatMessagesTable } from "drizzle/schema";
import type { ChatMessage } from "~/features/chats/entities/chat-message";
import { ChatMessagesMapper } from "~/features/chats/mappers/chat-messages";
import type { ChatMessageRepository } from "~/features/chats/repositories/chat-message";
import {
	BaseDrizzleRepository,
	type DrizzleTransaction,
} from "./base.repository";

export class DrizzleChatMessageRepository
	extends BaseDrizzleRepository
	implements ChatMessageRepository
{
	setTransaction(tx: DrizzleTransaction): ChatMessageRepository {
		return new DrizzleChatMessageRepository(tx);
	}

	async findById(id: string): Promise<ChatMessage | null> {
		const message = await this.drizzle.client
			.select()
			.from(chatMessagesTable)
			.where(eq(chatMessagesTable.id, id));

		return message[0] ? ChatMessagesMapper.toDomain(message[0]) : null;
	}
}
