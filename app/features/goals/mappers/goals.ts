import type { goalsTable } from "drizzle/schema";
import type { ChatMessage } from "~/features/chats/entities/chat-message";
import type { GoalAggregate } from "../aggregates/goal-aggregate";
import { Goal } from "../entities/goal";
import type { UpdateGoalInput } from "../repositories/goal";

export const GoalsMapper = {
	toHtml<T extends GoalAggregate<ChatMessage | null> | Goal>(goal: T) {
		return {
			id: goal.id,
			title: goal.title,
			description: goal.description,
			estimated_time: goal.estimated_time,
			action_steps: goal.action_steps,
			progress_indicators: goal.progress_indicators,
			suggested_habits: goal.suggested_habits,
			motivation_strategies: goal.motivation_strategies,
			chat_id: "message" in goal ? goal.message?.chatId : null,
			created_at: goal.created_at.toLocaleString("pt-BR"),
			updated_at: goal.updated_at.toLocaleString("pt-BR"),
		};
	},
	toDomain(goal: typeof goalsTable.$inferSelect): Goal {
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
			created_at: goal.created_at,
			updated_at: goal.updated_at,
		});
	},
	toPersistence(goal: Goal): typeof goalsTable.$inferInsert {
		return {
			id: goal.id,
			title: goal.title,
			description: goal.description,
			estimated_time: goal.estimated_time,
			action_steps: goal.action_steps,
			progress_indicators: goal.progress_indicators,
			suggested_habits: goal.suggested_habits,
			motivation_strategies: goal.motivation_strategies,
			chat_message_id: goal.chat_message_id,
			created_at: goal.created_at,
			updated_at: goal.updated_at,
		};
	},
	toUpdatePersistence(
		goal: UpdateGoalInput,
	): Partial<typeof goalsTable.$inferInsert> {
		return {
			title: goal.title,
			description: goal.description,
			estimated_time: goal.estimated_time,
			action_steps: goal.action_steps,
			progress_indicators: goal.progress_indicators,
			suggested_habits: goal.suggested_habits,
			motivation_strategies: goal.motivation_strategies,
			chat_message_id: goal.chat_message_id,
			updated_at: goal.updated_at,
		};
	},
};
