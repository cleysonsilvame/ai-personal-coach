import type { ChatMessage as PrismaChatMessage } from "generated/prisma";
import { marked } from "marked";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import { ChatMessage, type ChatMessageContent } from "../entities/chat-message";

const window = new JSDOM("").window;
const purify = createDOMPurify(window);

export const ChatMessagesMapper = {
	toHtml<T extends PrismaChatMessage>(chatMessage: T) {
		const content = JSON.parse(
			String(chatMessage.content),
		) as ChatMessageContent;

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
	toDomain<T extends PrismaChatMessage>(chatMessage: T) {
		const content = JSON.parse(
			String(chatMessage.content),
		) as ChatMessageContent; // TODO: should be use a zod schema to parse the content

		return new ChatMessage({
			id: chatMessage.id,
			content,
			role: chatMessage.role,
			createdAt: chatMessage.created_at,
			updatedAt: chatMessage.updated_at,
		});
	},
};
