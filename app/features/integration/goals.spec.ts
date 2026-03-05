import { describe, expect, it, vi } from "vitest";
import type { ChatMessage as ChatMessageType } from "~/features/chats/entities/chat-message";
import { ChatMessage } from "~/features/chats/entities/chat-message";
import type { ChatMessageContent } from "~/features/chats/entities/chat-message";
import type { ChatMessageRepository } from "~/features/chats/repositories/chat-message";
import type { Transaction } from "~/features/core/services/transaction";
import type { UnitOfWork } from "~/features/core/services/unit-of-work";
import type { GoalAggregate } from "../goals/aggregates/goal-aggregate";
import { Goal } from "../goals/entities/goal";
import { SimilarGoal } from "../goals/entities/similar-goal";
import type { GoalRepository } from "../goals/repositories/goal";
import type { GoalEmbeddingRepository } from "../goals/repositories/goal-embedding";
import type { GoalCacheService } from "../goals/services/cache";
import type { EmbeddingService } from "../goals/services/embedding";
import { CreateGoalFromMessageUseCase } from "../goals/use-cases/create-goal-from-message.server";
import { DeleteGoalUseCase } from "../goals/use-cases/delete-goal.server";
import { GetGoalByIdUseCase } from "../goals/use-cases/get-goal-by-id.server";
import { GetGoalsUseCase } from "../goals/use-cases/get-goals.server";

/**
 * Integration tests for goals application flows.
 * These tests validate the interaction between multiple use cases and repositories.
 */

const makeGoalData = (): ChatMessageContent["data"] => ({
	title: "Desenvolver Fluência em Inglês",
	description: "Plano estruturado para alcançar fluência em inglês.",
	estimated_time: "12-18 meses",
	action_steps: ["Avaliar nível atual", "Estudar 30 minutos por dia"],
	progress_indicators: ["Manter conversação de 10 minutos"],
	suggested_habits: ["Estudar inglês toda manhã"],
	motivation_strategies: "Definir marcos mensais com recompensas.",
});

const makeGoal = (overrides?: Partial<ConstructorParameters<typeof Goal>[0]>) =>
	new Goal({
		id: "goal-id-123",
		title: "Desenvolver Fluência em Inglês",
		description: "Plano estruturado para alcançar fluência em inglês.",
		estimated_time: "12-18 meses",
		action_steps: ["Avaliar nível atual"],
		progress_indicators: ["Manter conversação de 10 minutos"],
		suggested_habits: ["Estudar inglês toda manhã"],
		motivation_strategies: "Definir marcos mensais.",
		chat_message_id: "message-id-123",
		created_at: new Date("2024-01-01"),
		updated_at: new Date("2024-01-02"),
		...overrides,
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

describe("Integration Tests: Goals Flow", () => {
	describe("Create and Retrieve Goal Flow", () => {
		it("should create a goal from message and retrieve it by id", async () => {
			const chatMessageRepository = makeMockChatMessageRepository();
			const goalRepository = makeMockGoalRepository();
			const goalEmbeddingRepository = makeMockGoalEmbeddingRepository();
			const embeddingService = makeMockEmbeddingService();
			const goalCacheService = makeMockGoalCacheService();
			const uow = makeMockUnitOfWork();

			const message = makeAssistantMessage();
			const createdGoal = makeGoal();

			vi.mocked(chatMessageRepository.findById).mockResolvedValue(message);
			vi.mocked(goalRepository.createGoal).mockResolvedValue(createdGoal);
			vi.mocked(goalRepository.setTransaction).mockReturnValue(goalRepository);
			vi.mocked(goalEmbeddingRepository.setTransaction).mockReturnValue(
				goalEmbeddingRepository,
			);
			vi.mocked(goalRepository.findById).mockResolvedValue(createdGoal);

			// 1. Create goal from message
			const createUseCase = new CreateGoalFromMessageUseCase(
				chatMessageRepository,
				goalRepository,
				goalEmbeddingRepository,
				embeddingService,
				goalCacheService,
				uow,
			);

			await createUseCase.execute({ messageId: "message-id-123" });

			expect(goalRepository.createGoal).toHaveBeenCalledOnce();
			const savedGoal = vi.mocked(goalRepository.createGoal).mock.calls[0][0];
			expect(savedGoal.title).toBe("Desenvolver Fluência em Inglês");
			expect(savedGoal.chat_message_id).toBe("message-id-123");

			// 2. Retrieve goal by id
			const getGoalByIdUseCase = new GetGoalByIdUseCase(
				goalRepository,
				goalCacheService,
				embeddingService,
				goalEmbeddingRepository,
			);

			const result = await getGoalByIdUseCase.execute("goal-id-123", false);

			expect(result.goal.title).toBe("Desenvolver Fluência em Inglês");
			expect(result.similarGoals).toBeNull();
		});

		it("should list all goals after creation", async () => {
			const chatMessageRepository = makeMockChatMessageRepository();
			const goalRepository = makeMockGoalRepository();
			const goalEmbeddingRepository = makeMockGoalEmbeddingRepository();
			const embeddingService = makeMockEmbeddingService();
			const goalCacheService = makeMockGoalCacheService();
			const uow = makeMockUnitOfWork();

			const message = makeAssistantMessage();
			const goal1 = makeGoal({ id: "goal-1", title: "Plano de Inglês" });
			const goal2 = makeGoal({
				id: "goal-2",
				title: "Saúde e Bem-estar",
				chat_message_id: null,
			});

			vi.mocked(chatMessageRepository.findById).mockResolvedValue(message);
			vi.mocked(goalRepository.createGoal).mockResolvedValue(goal1);
			vi.mocked(goalRepository.setTransaction).mockReturnValue(goalRepository);
			vi.mocked(goalEmbeddingRepository.setTransaction).mockReturnValue(
				goalEmbeddingRepository,
			);
			vi.mocked(goalRepository.findAll).mockResolvedValue([
				goal1,
				goal2,
			] as GoalAggregate<ChatMessageType | null>[]);

			// 1. Create a goal
			const createUseCase = new CreateGoalFromMessageUseCase(
				chatMessageRepository,
				goalRepository,
				goalEmbeddingRepository,
				embeddingService,
				goalCacheService,
				uow,
			);

			await createUseCase.execute({ messageId: "message-id-123" });

			// 2. List all goals
			const getGoalsUseCase = new GetGoalsUseCase(goalRepository);
			const goals = await getGoalsUseCase.execute();

			expect(goals).toHaveLength(2);
			expect(goals[0].title).toBe("Plano de Inglês");
			expect(goals[1].title).toBe("Saúde e Bem-estar");
		});
	});

	describe("Create and Delete Goal Flow", () => {
		it("should create a goal and then delete it", async () => {
			const chatMessageRepository = makeMockChatMessageRepository();
			const goalRepository = makeMockGoalRepository();
			const goalEmbeddingRepository = makeMockGoalEmbeddingRepository();
			const embeddingService = makeMockEmbeddingService();
			const goalCacheService = makeMockGoalCacheService();
			const uow = makeMockUnitOfWork();

			const message = makeAssistantMessage();
			const createdGoal = makeGoal();

			vi.mocked(chatMessageRepository.findById).mockResolvedValue(message);
			vi.mocked(goalRepository.createGoal).mockResolvedValue(createdGoal);
			vi.mocked(goalRepository.setTransaction).mockReturnValue(goalRepository);
			vi.mocked(goalEmbeddingRepository.setTransaction).mockReturnValue(
				goalEmbeddingRepository,
			);
			vi.mocked(goalRepository.deleteById).mockResolvedValue(undefined);

			// 1. Create goal
			const createUseCase = new CreateGoalFromMessageUseCase(
				chatMessageRepository,
				goalRepository,
				goalEmbeddingRepository,
				embeddingService,
				goalCacheService,
				uow,
			);

			await createUseCase.execute({ messageId: "message-id-123" });

			// 2. Delete the goal
			const deleteUseCase = new DeleteGoalUseCase(
				goalRepository,
				goalCacheService,
				uow,
			);

			await deleteUseCase.execute(createdGoal.id);

			expect(goalRepository.deleteById).toHaveBeenCalledWith(createdGoal.id);
			// Cache should be invalidated twice (once on create, once on delete)
			expect(goalCacheService.invalidateAllSimilarGoals).toHaveBeenCalledTimes(
				2,
			);
		});
	});

	describe("Cache Coherency Flow", () => {
		it("should invalidate cache when creating a goal", async () => {
			const chatMessageRepository = makeMockChatMessageRepository();
			const goalRepository = makeMockGoalRepository();
			const goalEmbeddingRepository = makeMockGoalEmbeddingRepository();
			const embeddingService = makeMockEmbeddingService();
			const goalCacheService = makeMockGoalCacheService();
			const uow = makeMockUnitOfWork();

			const message = makeAssistantMessage();
			const createdGoal = makeGoal();

			vi.mocked(chatMessageRepository.findById).mockResolvedValue(message);
			vi.mocked(goalRepository.createGoal).mockResolvedValue(createdGoal);
			vi.mocked(goalRepository.setTransaction).mockReturnValue(goalRepository);
			vi.mocked(goalEmbeddingRepository.setTransaction).mockReturnValue(
				goalEmbeddingRepository,
			);

			const createUseCase = new CreateGoalFromMessageUseCase(
				chatMessageRepository,
				goalRepository,
				goalEmbeddingRepository,
				embeddingService,
				goalCacheService,
				uow,
			);

			await createUseCase.execute({ messageId: "message-id-123" });

			expect(goalCacheService.invalidateAllSimilarGoals).toHaveBeenCalledOnce();
		});

		it("should use cached similar goals on second retrieval", async () => {
			const goalRepository = makeMockGoalRepository();
			const goalCacheService = makeMockGoalCacheService();
			const embeddingService = makeMockEmbeddingService();
			const goalEmbeddingRepository = makeMockGoalEmbeddingRepository();

			const goal = makeGoal();
			const similarGoals: SimilarGoal[] = [
				new SimilarGoal({
					id: "similar-1",
					title: "Aprender Espanhol",
					description: "Outro idioma",
					estimated_time: "12 meses",
					similarity: 0.92,
				}),
			];

			vi.mocked(goalRepository.findById).mockResolvedValue(goal);
			vi.mocked(goalCacheService.getSimilarGoals)
				.mockResolvedValueOnce(null) // First call: cache miss
				.mockResolvedValueOnce(similarGoals); // Second call: cache hit

			vi.mocked(embeddingService.createEmbeddingFromText).mockResolvedValue([
				0.1, 0.2,
			]);
			vi.mocked(goalEmbeddingRepository.findSimilar).mockResolvedValue(
				similarGoals,
			);

			const getGoalByIdUseCase = new GetGoalByIdUseCase(
				goalRepository,
				goalCacheService,
				embeddingService,
				goalEmbeddingRepository,
			);

			// First retrieval (cache miss - hits DB)
			const result1 = await getGoalByIdUseCase.execute("goal-id-123", true);
			expect(embeddingService.createEmbeddingFromText).toHaveBeenCalledOnce();

			// Second retrieval (cache hit - uses cache)
			vi.mocked(embeddingService.createEmbeddingFromText).mockClear();
			const result2 = await getGoalByIdUseCase.execute("goal-id-123", true);

			expect(embeddingService.createEmbeddingFromText).not.toHaveBeenCalled();
			expect(result1.similarGoals).toEqual(similarGoals);
			expect(result2.similarGoals).toEqual(similarGoals);
		});
	});
});
