import type { ChatMessage } from "~/features/chats/entities/chat-message";
import { Goal } from "../entities/goal";

export class GoalAggregate<
	Message extends ChatMessage | null = never,
> extends Goal {
	readonly message!: Message;

	constructor(goal: Goal, message?: Message) {
		super(goal);
		if (message) {
			this.message = message;
		}
	}
}
