import { inject, injectable } from "inversify";
import { ChatRepository } from "../repositories/chat";
import type { Chat } from "../entities/chat";

export interface GetChatsListResult {
	chats: Chat[];
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
