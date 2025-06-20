import type { ChatMessage } from "../entities/chat-message";

export abstract class ChatMessageRepository {
	abstract findById(id: string): Promise<ChatMessage | null>;
}
