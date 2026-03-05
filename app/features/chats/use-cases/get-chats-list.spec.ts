import { describe, expect, it, vi } from "vitest";
import { Chat } from "../entities/chat";
import type { ChatRepository } from "../repositories/chat";
import { GetChatsListUseCase } from "./get-chats-list.server";

const makeMockChatRepository = (): ChatRepository => ({
	setTransaction: vi.fn().mockReturnThis(),
	findById: vi.fn(),
	create: vi.fn(),
	updateById: vi.fn(),
	createChatMessages: vi.fn(),
	deleteChat: vi.fn(),
	findAll: vi.fn(),
});

const makeChat = (overrides?: Partial<ConstructorParameters<typeof Chat>[0]>) =>
	new Chat({
		id: "chat-id-123",
		title: "Meu plano de inglês",
		created_at: new Date("2024-01-01"),
		updated_at: new Date("2024-01-02"),
		...overrides,
	});

describe("GetChatsListUseCase", () => {
	it("should return all chats from repository", async () => {
		const chatRepository = makeMockChatRepository();
		const chats = [
			makeChat({ id: "chat-1", title: "Plano de Inglês" }),
			makeChat({ id: "chat-2", title: "Saúde e Bem-estar" }),
		];
		vi.mocked(chatRepository.findAll).mockResolvedValue(chats);

		const useCase = new GetChatsListUseCase(chatRepository);
		const result = await useCase.execute();

		expect(result.chats).toHaveLength(2);
		expect(result.chats[0].title).toBe("Plano de Inglês");
		expect(result.chats[1].title).toBe("Saúde e Bem-estar");
	});

	it("should return empty array when no chats exist", async () => {
		const chatRepository = makeMockChatRepository();
		vi.mocked(chatRepository.findAll).mockResolvedValue([]);

		const useCase = new GetChatsListUseCase(chatRepository);
		const result = await useCase.execute();

		expect(result.chats).toHaveLength(0);
	});

	it("should call chatRepository.findAll once", async () => {
		const chatRepository = makeMockChatRepository();
		vi.mocked(chatRepository.findAll).mockResolvedValue([]);

		const useCase = new GetChatsListUseCase(chatRepository);
		await useCase.execute();

		expect(chatRepository.findAll).toHaveBeenCalledTimes(1);
	});

	it("should return chats with correct structure", async () => {
		const chatRepository = makeMockChatRepository();
		const chat = makeChat();
		vi.mocked(chatRepository.findAll).mockResolvedValue([chat]);

		const useCase = new GetChatsListUseCase(chatRepository);
		const result = await useCase.execute();

		const returnedChat = result.chats[0];
		expect(returnedChat).toBeInstanceOf(Chat);
		expect(returnedChat.id).toBe("chat-id-123");
		expect(returnedChat.title).toBe("Meu plano de inglês");
	});
});
