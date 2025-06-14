import type { Goal } from "generated/prisma";
import type { GoalGetPayload } from "generated/prisma/models";

export const GoalsMapper = {
	toHtml(goal: GoalGetPayload<{ include: { chat_message: true } }>) {
		return {
			id: goal.id,
			title: goal.title,
			description: goal.description,
			estimated_time: goal.estimated_time,
			motivation_strategies: goal.motivation_strategies,
			action_steps: goal.action_steps as string[],
			progress_indicators: goal.progress_indicators as string[],
			suggested_habits: goal.suggested_habits as string[],
			chat_id: goal.chat_message?.chat_id,
			created_at: new Date(goal.created_at).toLocaleString("pt-BR"),
			updated_at: goal.updated_at
				? new Date(goal.updated_at).toLocaleString("pt-BR")
				: null,
		};
	},
};
