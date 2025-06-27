import type { Goal } from "~/features/goals/entities/goal";
import { ChatMessage } from "../entities/chat-message";

export class ChatMessageAggregate<
	G extends Goal | null | undefined = never,
> extends ChatMessage {
	readonly goal!: G;
	constructor(chatMessage: ChatMessage, goal?: G) {
		super(chatMessage);

		if (goal) {
			this.goal = goal;
		}
	}
}
