import type { Prisma, Goal as PrismaGoal } from "generated/prisma";
import type { GoalGetPayload } from "generated/prisma/models";
import { Goal } from "../entities/goal";

export const GoalsMapper = {
	toHtml<
		T extends GoalGetPayload<{ include: { chat_message: true } }> | PrismaGoal,
	>(goal: T) {
		return {
			id: goal.id,
			title: goal.title,
			description: goal.description,
			estimated_time: goal.estimated_time,
			motivation_strategies: goal.motivation_strategies,
			action_steps: goal.action_steps as string[],
			progress_indicators: goal.progress_indicators as string[],
			suggested_habits: goal.suggested_habits as string[],
			chat_id: "chat_message" in goal ? goal.chat_message?.chat_id : null,
			created_at: new Date(goal.created_at).toLocaleString("pt-BR"),
			updated_at: goal.updated_at
				? new Date(goal.updated_at).toLocaleString("pt-BR")
				: null,
		};
	},
	toDomain(goal: PrismaGoal): Goal {
		return new Goal({
			id: goal.id,
			title: goal.title,
			description: goal.description,
			estimated_time: goal.estimated_time,
			action_steps: goal.action_steps as string[],
			progress_indicators: goal.progress_indicators as string[],
			suggested_habits: goal.suggested_habits as string[],
			motivation_strategies: goal.motivation_strategies,
			chat_message_id: goal.chat_message_id,
		});
	},
	toPrisma(goal: Goal): Prisma.GoalCreateInput {
		return {
			id: goal.id,
			title: goal.title,
			description: goal.description,
			estimated_time: goal.estimated_time,
			action_steps: goal.action_steps,
			progress_indicators: goal.progress_indicators,
			suggested_habits: goal.suggested_habits,
			motivation_strategies: goal.motivation_strategies,
			chat_message: goal.chat_message_id
				? { connect: { id: goal.chat_message_id } }
				: undefined,
		};
	},
};
