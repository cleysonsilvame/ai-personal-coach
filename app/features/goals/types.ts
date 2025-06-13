import type { ChatMessageGetPayload } from "generated/prisma/models";
import type { ChatMessageContentData } from "./mappers/chat-messages";

interface Message
	extends Omit<ChatMessageGetPayload<{ include: { goal: true } }>, "content"> {
	content: ChatMessageContentData;
}

export interface GetChatMessagesResult {
	messages: Message[];
	goal_id?: string;
	message_id?: string;
	goal_content?: ChatMessageContentData["data"];
}

export interface SendMessageResult {
	chatId: string;
}
