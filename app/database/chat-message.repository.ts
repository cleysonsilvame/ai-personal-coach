import { inject } from "inversify";
import type { ChatMessage } from "~/features/chats/entities/chat-message";
import { ChatMessagesMapper } from "~/features/chats/mappers/chat-messages";
import { ChatMessageRepository } from "~/features/chats/repositories/chat-message";
import { PrismaClient } from "~/lib/prisma-client";

export class PrismaChatMessageRepository extends ChatMessageRepository {
	constructor(@inject(PrismaClient) private readonly prisma: PrismaClient) {
		super();
	}

	async findById(id: string): Promise<ChatMessage | null> {
		const message = await this.prisma.client.chatMessage.findUnique({
			where: { id },
		});

		return message ? ChatMessagesMapper.toDomain(message) : null;
	}
}
