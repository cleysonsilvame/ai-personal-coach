import createDOMPurify from "dompurify";
import type { ChatMessage as PrismaChatMessage } from "generated/prisma";
import { JSDOM } from "jsdom";
import { marked } from "marked";
import { z } from "zod";
import { ChatMessage } from "../entities/chat-message";

const window = new JSDOM("").window;
const purify = createDOMPurify(window);

const ChatMessageContentSchema = z.object({
	message: z.string().min(1, "Message cannot be empty"),
	data: z
		.object({
			title: z.string().min(1, "Title cannot be empty"),
			description: z.string().min(1, "Description cannot be empty"),
			estimated_time: z.string().min(1, "Estimated time cannot be empty"),
			action_steps: z.array(z.string().min(1, "Action step cannot be empty")),
			progress_indicators: z.array(
				z.string().min(1, "Progress indicator cannot be empty"),
			),
			suggested_habits: z.array(z.string().min(1, "Habit cannot be empty")),
			motivation_strategies: z
				.string()
				.min(1, "Motivation strategy cannot be empty"),
		})
		.optional(),
});

export const ChatMessagesMapper = {
	toHtml<T extends ChatMessage>(chatMessage: T) {
		chatMessage.content.message = purify.sanitize(
			marked.parse(chatMessage.content.message, { async: false }),
		);

		return chatMessage;
	},
	toDomain<T extends PrismaChatMessage>(chatMessage: T) {
		return new ChatMessage({
			id: chatMessage.id,
			content: ChatMessageContentSchema.parse(
				JSON.parse(String(chatMessage.content)),
			),
			role: chatMessage.role,
			createdAt: chatMessage.created_at,
			updatedAt: chatMessage.updated_at,
			chatId: chatMessage.chat_id,
		});
	},
};
