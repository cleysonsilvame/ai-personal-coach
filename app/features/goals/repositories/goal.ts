import type { Goal as PrismaGoal } from "generated/prisma";
import type { GoalGetPayload, GoalUpdateInput } from "generated/prisma/models";
import type { Goal } from "../entities/goal";

export abstract class GoalRepository {
	abstract createGoal(goal: Goal): Promise<Goal>;

	abstract findById(id: string): Promise<PrismaGoal | null>;

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
