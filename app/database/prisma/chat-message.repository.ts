import type { ChatMessage } from "~/features/chats/entities/chat-message";
import { ChatMessagesMapper } from "~/features/chats/mappers/chat-messages";
import type { ChatMessageRepository } from "~/features/chats/repositories/chat-message";
import { BasePrismaRepository } from "./base.repository";
import type { Prisma } from "generated/prisma";

export class PrismaChatMessageRepository
	extends BasePrismaRepository
	implements ChatMessageRepository
{
	setTransaction(tx: Prisma.TransactionClient): ChatMessageRepository {
		return new PrismaChatMessageRepository(tx);
	}

	async findById(id: string): Promise<ChatMessage | null> {
		const message = await this.prisma.client.chatMessage.findUnique({
			where: { id },
		});

		return message ? ChatMessagesMapper.toDomain(message) : null;
	}
}
