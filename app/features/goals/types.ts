import type { ChatMessageGetPayload } from "generated/prisma/models";

export interface GoalData {
	assistant_message: string;
	title: string;
	description: string;
	estimated_time: string;
	action_steps: string[];
	progress_indicators: string[];
	suggested_habits: string[];
	motivation_strategies: string;
}

export interface MappedMessage
	extends ChatMessageGetPayload<{ include: { goal: true } }> {
	goal_content?: GoalData;
}

export interface GetChatMessagesResult {
	messages: MappedMessage[];
	goal_id?: string;
	message_id?: string;
	goal_content?: GoalData;
}

export interface SendMessageResult {
	chatId: string;
}
