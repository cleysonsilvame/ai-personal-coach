import type { ChatMessage } from "~/features/chats/entities/chat-message";
import type { Transaction } from "~/features/core/services/transaction";
import type { GoalAggregate } from "../aggregates/goal-aggregate";
import type { Goal } from "../entities/goal";

export type FindAllInclude = {
	chatMessage: boolean;
};

export type GoalPayload<T extends FindAllInclude> = T extends {
	chatMessage: true;
}
	? GoalAggregate<ChatMessage | null>[]
	: GoalAggregate[];

export type UpdateGoalInput = Omit<
	Goal,
	"id" | "created_at" | "chat_message_id" | "removeMessageLink" | "toMarkdown"
>;

export abstract class GoalRepository {
	abstract setTransaction(tx: Transaction): GoalRepository;

	abstract createGoal(goal: Goal): Promise<Goal>;

	abstract findById(id: string): Promise<Goal | null>;

	abstract findAll<T extends FindAllInclude>(
		include?: T,
	): Promise<GoalPayload<T>>;
	abstract findAll(
		include?: FindAllInclude,
	): Promise<GoalAggregate<ChatMessage | null>[]>;

	abstract deleteById(id: string): Promise<void>;

	abstract updateById(id: string, data: UpdateGoalInput): Promise<Goal>;
}
