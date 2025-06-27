import type { Goal } from "~/features/goals/entities/goal";
import { Chat } from "../entities/chat";
import type { ChatMessageAggregate } from "./chat-message-aggregate";
import type { ChatMessage } from "../entities/chat-message";

export class ChatAggregate<
	Messages extends
		| ChatMessage[]
		| ChatMessageAggregate<Goal>[]
		| undefined = never,
> extends Chat {
	readonly messages!: Messages;

	constructor(chat: Chat, messages?: Messages) {
		super(chat);
		if (messages) {
			this.messages = messages;
		}
	}
}
