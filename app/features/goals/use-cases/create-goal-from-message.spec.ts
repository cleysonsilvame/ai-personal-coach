import { describe, expect, it, vi } from "vitest";
import type { ChatMessageContent } from "~/features/chats/entities/chat-message";
import { ChatMessage } from "~/features/chats/entities/chat-message";
import type { ChatMessageRepository } from "~/features/chats/repositories/chat-message";
import type { Transaction } from "~/features/core/services/transaction";
import type { UnitOfWork } from "~/features/core/services/unit-of-work";
import { Goal } from "../entities/goal";
import type { GoalRepository } from "../repositories/goal";
import type { GoalEmbeddingRepository } from "../repositories/goal-embedding";
import type { GoalCacheService } from "../services/cache";
import type { EmbeddingService } from "../services/embedding";
import { CreateGoalFromMessageUseCase } from "./create-goal-from-message.server";

const makeGoalData = (): ChatMessageContent["data"] => ({
	title: "Desenvolver Fluência em Inglês",
	description: "Plano estruturado para alcançar fluência em inglês.",
	estimated_time: "12-18 meses",
	action_steps: ["Avaliar nível atual", "Estudar 30 minutos por dia"],
	progress_indicators: ["Manter conversação de 10 minutos"],
	suggested_habits: ["Estudar inglês toda manhã"],
	motivation_strategies: "Definir marcos mensais com recompensas.",
});

const makeAssistantMessage = (goalData?: ChatMessageContent["data"]) =>
	new ChatMessage({
		id: "message-id-123",
		content: {
			message: "Refinei seu objetivo!",
			data: goalData ?? makeGoalData(),
		},
		role: "assistant",
		createdAt: new Date("2024-01-01"),
		updatedAt: new Date("2024-01-01"),
		chatId: "chat-id-456",
	});

const makeMockChatMessageRepository = (): ChatMessageRepository => ({
	setTransaction: vi.fn().mockReturnThis(),
	findById: vi.fn(),
});

const makeMockGoalRepository = (): GoalRepository => ({
	setTransaction: vi.fn().mockReturnThis(),
	createGoal: vi.fn(),
	findById: vi.fn(),
	findAll: vi.fn(),
	deleteById: vi.fn(),
	updateById: vi.fn(),
});

const makeMockGoalEmbeddingRepository = (): GoalEmbeddingRepository => ({
	setTransaction: vi.fn().mockReturnThis(),
	createMany: vi.fn().mockResolvedValue(undefined),
	deleteByGoalId: vi.fn().mockResolvedValue(undefined),
	findSimilar: vi.fn().mockResolvedValue([]),
});

const makeMockEmbeddingService = (): EmbeddingService => ({
	createEmbeddingsFromMarkdown: vi.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
	createEmbeddingFromText: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
});

const makeMockGoalCacheService = (): GoalCacheService => ({
	getSimilarGoals: vi.fn().mockResolvedValue(null),
	setSimilarGoals: vi.fn().mockResolvedValue(undefined),
	invalidateSimilarGoals: vi.fn().mockResolvedValue(undefined),
	invalidateAllSimilarGoals: vi.fn().mockResolvedValue(undefined),
});

const makeMockUnitOfWork = (): UnitOfWork => ({
	execute: vi
		.fn()
		.mockImplementation(async (fn: (tx: Transaction) => Promise<void>) => {
			await fn({} as Transaction);
		}),
});

describe("CreateGoalFromMessageUseCase", () => {
	it("should create a goal from a valid assistant message", async () => {
		const chatMessageRepository = makeMockChatMessageRepository();
		const goalRepository = makeMockGoalRepository();
		const goalEmbeddingRepository = makeMockGoalEmbeddingRepository();
		const embeddingService = makeMockEmbeddingService();
		const goalCacheService = makeMockGoalCacheService();
		const uow = makeMockUnitOfWork();

		const message = makeAssistantMessage();
		vi.mocked(chatMessageRepository.findById).mockResolvedValue(message);
		vi.mocked(goalRepository.createGoal).mockImplementation(
			async (goal: Goal) => goal,
		);
		vi.mocked(goalRepository.setTransaction).mockReturnValue(goalRepository);
		vi.mocked(goalEmbeddingRepository.setTransaction).mockReturnValue(
			goalEmbeddingRepository,
		);

		const useCase = new CreateGoalFromMessageUseCase(
			chatMessageRepository,
			goalRepository,
			goalEmbeddingRepository,
			embeddingService,
			goalCacheService,
			uow,
		);

		await useCase.execute({ messageId: "message-id-123" });

		expect(chatMessageRepository.findById).toHaveBeenCalledWith(
			"message-id-123",
		);
		expect(goalRepository.createGoal).toHaveBeenCalledOnce();

		const createdGoal = vi.mocked(goalRepository.createGoal).mock.calls[0][0];
		expect(createdGoal).toBeInstanceOf(Goal);
		expect(createdGoal.title).toBe("Desenvolver Fluência em Inglês");
		expect(createdGoal.description).toBe(
			"Plano estruturado para alcançar fluência em inglês.",
		);
		expect(createdGoal.chat_message_id).toBe("message-id-123");
	});

	it("should create embeddings for the goal", async () => {
		const chatMessageRepository = makeMockChatMessageRepository();
		const goalRepository = makeMockGoalRepository();
		const goalEmbeddingRepository = makeMockGoalEmbeddingRepository();
		const embeddingService = makeMockEmbeddingService();
		const goalCacheService = makeMockGoalCacheService();
		const uow = makeMockUnitOfWork();

		const message = makeAssistantMessage();
		const createdGoal = Goal.create({
			title: "Desenvolver Fluência em Inglês",
			description: "Plano estruturado.",
			estimated_time: "12 meses",
			action_steps: [],
			progress_indicators: [],
			suggested_habits: [],
			motivation_strategies: "Estratégia",
			chat_message_id: message.id,
		});

		vi.mocked(chatMessageRepository.findById).mockResolvedValue(message);
		vi.mocked(goalRepository.createGoal).mockResolvedValue(createdGoal);
		vi.mocked(goalRepository.setTransaction).mockReturnValue(goalRepository);
		vi.mocked(goalEmbeddingRepository.setTransaction).mockReturnValue(
			goalEmbeddingRepository,
		);
		vi.mocked(embeddingService.createEmbeddingsFromMarkdown).mockResolvedValue([
			[0.1, 0.2],
			[0.3, 0.4],
		]);

		const useCase = new CreateGoalFromMessageUseCase(
			chatMessageRepository,
			goalRepository,
			goalEmbeddingRepository,
			embeddingService,
			goalCacheService,
			uow,
		);

		await useCase.execute({ messageId: "message-id-123" });

		expect(
			embeddingService.createEmbeddingsFromMarkdown,
		).toHaveBeenCalledOnce();
		expect(goalEmbeddingRepository.createMany).toHaveBeenCalledOnce();
	});

	it("should invalidate cache after creating goal", async () => {
		const chatMessageRepository = makeMockChatMessageRepository();
		const goalRepository = makeMockGoalRepository();
		const goalEmbeddingRepository = makeMockGoalEmbeddingRepository();
		const embeddingService = makeMockEmbeddingService();
		const goalCacheService = makeMockGoalCacheService();
		const uow = makeMockUnitOfWork();

		const message = makeAssistantMessage();
		vi.mocked(chatMessageRepository.findById).mockResolvedValue(message);
		vi.mocked(goalRepository.createGoal).mockImplementation(
			async (goal: Goal) => goal,
		);
		vi.mocked(goalRepository.setTransaction).mockReturnValue(goalRepository);
		vi.mocked(goalEmbeddingRepository.setTransaction).mockReturnValue(
			goalEmbeddingRepository,
		);

		const useCase = new CreateGoalFromMessageUseCase(
			chatMessageRepository,
			goalRepository,
			goalEmbeddingRepository,
			embeddingService,
			goalCacheService,
			uow,
		);

		await useCase.execute({ messageId: "message-id-123" });

		expect(goalCacheService.invalidateAllSimilarGoals).toHaveBeenCalledOnce();
	});

	it("should throw error when message is not found", async () => {
		const chatMessageRepository = makeMockChatMessageRepository();
		const goalRepository = makeMockGoalRepository();
		const goalEmbeddingRepository = makeMockGoalEmbeddingRepository();
		const embeddingService = makeMockEmbeddingService();
		const goalCacheService = makeMockGoalCacheService();
		const uow = makeMockUnitOfWork();

		vi.mocked(chatMessageRepository.findById).mockResolvedValue(null);

		const useCase = new CreateGoalFromMessageUseCase(
			chatMessageRepository,
			goalRepository,
			goalEmbeddingRepository,
			embeddingService,
			goalCacheService,
			uow,
		);

		await expect(
			useCase.execute({ messageId: "nonexistent-id" }),
		).rejects.toThrow("Mensagem não encontrada");
	});

	it("should throw error when message has no data content", async () => {
		const chatMessageRepository = makeMockChatMessageRepository();
		const goalRepository = makeMockGoalRepository();
		const goalEmbeddingRepository = makeMockGoalEmbeddingRepository();
		const embeddingService = makeMockEmbeddingService();
		const goalCacheService = makeMockGoalCacheService();
		const uow = makeMockUnitOfWork();

		const messageWithoutData = new ChatMessage({
			id: "message-id-no-data",
			content: { message: "Não consegui processar o objetivo." },
			role: "assistant",
			createdAt: new Date(),
			updatedAt: new Date(),
			chatId: "chat-id",
		});

		vi.mocked(chatMessageRepository.findById).mockResolvedValue(
			messageWithoutData,
		);

		const useCase = new CreateGoalFromMessageUseCase(
			chatMessageRepository,
			goalRepository,
			goalEmbeddingRepository,
			embeddingService,
			goalCacheService,
			uow,
		);

		await expect(
			useCase.execute({ messageId: "message-id-no-data" }),
		).rejects.toThrow("Conteúdo da mensagem não encontrado");
	});
});
