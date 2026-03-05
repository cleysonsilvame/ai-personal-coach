import { describe, expect, it, vi } from "vitest";
import type { ChatRepository } from "../repositories/chat";
import { DeleteChatUseCase } from "./delete-chat.server";

const makeMockChatRepository = (): ChatRepository => ({
	setTransaction: vi.fn().mockReturnThis(),
	findById: vi.fn(),
	create: vi.fn(),
	updateById: vi.fn(),
	createChatMessages: vi.fn(),
	deleteChat: vi.fn().mockResolvedValue(undefined),
	findAll: vi.fn(),
});

describe("DeleteChatUseCase", () => {
	it("should call chatRepository.deleteChat with the provided chatId", async () => {
		const chatRepository = makeMockChatRepository();

		const useCase = new DeleteChatUseCase(chatRepository);
		await useCase.execute({ chatId: "chat-id-123" });

		expect(chatRepository.deleteChat).toHaveBeenCalledWith("chat-id-123");
		expect(chatRepository.deleteChat).toHaveBeenCalledTimes(1);
	});

	it("should call deleteChat with different chat IDs correctly", async () => {
		const chatRepository = makeMockChatRepository();

		const useCase = new DeleteChatUseCase(chatRepository);
		await useCase.execute({ chatId: "another-chat-id" });

		expect(chatRepository.deleteChat).toHaveBeenCalledWith("another-chat-id");
	});

	it("should propagate errors from the repository", async () => {
		const chatRepository = makeMockChatRepository();
		vi.mocked(chatRepository.deleteChat).mockRejectedValue(
			new Error("Deletion failed"),
		);

		const useCase = new DeleteChatUseCase(chatRepository);

		await expect(useCase.execute({ chatId: "chat-id-123" })).rejects.toThrow(
			"Deletion failed",
		);
	});
});
