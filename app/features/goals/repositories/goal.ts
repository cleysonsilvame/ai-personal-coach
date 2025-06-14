import type { Goal } from "generated/prisma";
import type {
	ChatMessageGetPayload,
	GoalCreateInput,
} from "generated/prisma/models";

export abstract class GoalRepository {
	abstract createGoal(goalData: GoalCreateInput): Promise<{ id: string }>;

	abstract findGoalByMessageId(
		messageId: string,
	): Promise<ChatMessageGetPayload<{ include: { goal: true } }> | null>;

	abstract findById(id: string): Promise<Goal | null>;

	abstract findAll(): Promise<Goal[]>;
}
