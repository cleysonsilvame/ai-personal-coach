import type { ChatMessage } from "generated/prisma";

export interface ChatMessageContentData {
	message: string;
	data?: {
		title: string;
		description: string;
		estimated_time: string;
		action_steps: string[];
		progress_indicators: string[];
		suggested_habits: string[];
		motivation_strategies: string;
	};
}

export const ChatMessagesMapper = {
	toDomain<T extends ChatMessage>(chatMessage: T) {
		return {
			...chatMessage,
			content: JSON.parse(
				String(chatMessage.content),
			) as ChatMessageContentData,
		};
	},
};
