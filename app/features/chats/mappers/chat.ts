import type { Chat as PrismaChat } from "generated/prisma";
import { Chat } from "../entities/chat";

export const ChatMapper = {
	toDomain(chat: PrismaChat): Chat {
		return new Chat({
			id: chat.id,
			title: chat.title,
			created_at: chat.created_at,
		});
	},
};
