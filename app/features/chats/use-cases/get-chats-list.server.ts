import { inject, injectable } from "inversify";
import { ChatRepository } from "../repositories/chat";

export interface ChatListItem {
	id: string;
	title: string | null;
	created_at: Date;
}

export interface GetChatsListResult {
	chats: ChatListItem[];
}

@injectable()
export class GetChatsListUseCase {
	constructor(
		@inject(ChatRepository)
		private readonly chatRepository: ChatRepository,
	) {}

	async execute(): Promise<GetChatsListResult> {
		const chats = await this.chatRepository.findAll();
		return { chats };
	}
}
