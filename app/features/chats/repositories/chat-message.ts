import type { Transaction } from "~/features/core/services/transaction";
import type { ChatMessage } from "../entities/chat-message";

export abstract class ChatMessageRepository {
	abstract setTransaction(tx: Transaction): ChatMessageRepository;
	abstract findById(id: string): Promise<ChatMessage | null>;
}
