export interface ChatListItem {
	id: string;
	title: string | null;
	created_at: Date;
}

export interface GetChatsListResult {
	chats: ChatListItem[];
}
