import { inject, injectable } from "inversify";
import { ChatRepository } from "../repositories/chat";

type UpdateChatUseCaseInput = {
	chatId: string;
	title: string;
};

@injectable()
export class UpdateChatUseCase {
	constructor(
		@inject(ChatRepository) private chatRepository: ChatRepository,
	) {}

	async execute({
		chatId,
		title,
	}: UpdateChatUseCaseInput): Promise<void> {
		await this.chatRepository.updateById(chatId, { title });
	}
}
