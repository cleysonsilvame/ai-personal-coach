import { Chat, type ChatProps } from "../entities/chat";

export const ChatMapper = {
	toDomain(chat: ChatProps): Chat {
		return new Chat({
			id: chat.id,
			title: chat.title,
			created_at: chat.created_at,
			updated_at: chat.updated_at,
		});
	},
};
