import type { ChatMessage } from "generated/prisma";
import { marked } from "marked";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

const window = new JSDOM("").window;
const purify = createDOMPurify(window);

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
	toHtml<T extends ChatMessage>(chatMessage: T) {
		const content = JSON.parse(
			String(chatMessage.content),
		) as ChatMessageContentData;

		return {
			...chatMessage,
			content: {
				...content,
				message: purify.sanitize(
					marked.parse(content.message, { async: false }),
				),
			},
		};
	},
	toDomain<T extends ChatMessage>(chatMessage: T) {
		const content = JSON.parse(
			String(chatMessage.content),
		) as ChatMessageContentData;

		return content;
	},
};
