import { inject, injectable } from "inversify";
import type { Chat } from "../entities/chat";
import { ChatRepository } from "../repositories/chat";

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
