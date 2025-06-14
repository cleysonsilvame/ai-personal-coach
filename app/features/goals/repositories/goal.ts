import type { Goal } from "generated/prisma";
import type {
	ChatMessageGetPayload,
	GoalCreateInput,
	GoalGetPayload,
	GoalUpdateInput,
} from "generated/prisma/models";

export abstract class GoalRepository {
	abstract createGoal(goalData: GoalCreateInput): Promise<{ id: string }>;

	abstract findGoalByMessageId(
		messageId: string,
	): Promise<ChatMessageGetPayload<{ include: { goal: true } }> | null>;

	abstract findById(id: string): Promise<Goal | null>;

	abstract findAll(): Promise<
		GoalGetPayload<{ include: { chat_message: true } }>[]
	>;

	abstract deleteById(id: string): Promise<void>;

	abstract updateById(
		id: string,
		data: Omit<GoalUpdateInput, "id">,
		options?: {
			removeMessageLink?: boolean;
		},
	): Promise<void>;
}
