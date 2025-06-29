import { inject, injectable } from "inversify";
import { ChatRepository } from "../repositories/chat";

type DeleteChatUseCaseInput = {
	chatId: string;
};

@injectable()
export class DeleteChatUseCase {
	constructor(
		@inject(ChatRepository) private chatRepository: ChatRepository,
	) {}

	async execute({ chatId }: DeleteChatUseCaseInput): Promise<void> {
		await this.chatRepository.deleteChat(chatId);
	}
}
