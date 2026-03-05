import { describe, expect, it, vi } from "vitest";
import { Goal } from "../entities/goal";
import type { SimilarGoal } from "../entities/similar-goal";
import type { GoalRepository } from "../repositories/goal";
import type { GoalEmbeddingRepository } from "../repositories/goal-embedding";
import type { GoalCacheService } from "../services/cache";
import type { EmbeddingService } from "../services/embedding";
import { GetGoalByIdUseCase } from "./get-goal-by-id.server";

const makeMockGoalRepository = (): GoalRepository => ({
	setTransaction: vi.fn().mockReturnThis(),
	createGoal: vi.fn(),
	findById: vi.fn(),
	findAll: vi.fn(),
	deleteById: vi.fn(),
	updateById: vi.fn(),
});

const makeMockGoalCacheService = (): GoalCacheService => ({
	getSimilarGoals: vi.fn().mockResolvedValue(null),
	setSimilarGoals: vi.fn().mockResolvedValue(undefined),
	invalidateSimilarGoals: vi.fn().mockResolvedValue(undefined),
	invalidateAllSimilarGoals: vi.fn().mockResolvedValue(undefined),
});

const makeMockEmbeddingService = (): EmbeddingService => ({
	createEmbeddingsFromMarkdown: vi.fn().mockResolvedValue([]),
	createEmbeddingFromText: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
});

const makeMockGoalEmbeddingRepository = (): GoalEmbeddingRepository => ({
	setTransaction: vi.fn().mockReturnThis(),
	createMany: vi.fn().mockResolvedValue(undefined),
	deleteByGoalId: vi.fn().mockResolvedValue(undefined),
	findSimilar: vi.fn().mockResolvedValue([]),
});

const makeGoal = (overrides?: Partial<ConstructorParameters<typeof Goal>[0]>) =>
	new Goal({
		id: "goal-id-123",
		title: "Desenvolver Fluência em Inglês",
		description: "Plano estruturado para alcançar fluência.",
		estimated_time: "12-18 meses",
		action_steps: ["Avaliar nível atual"],
		progress_indicators: ["Manter conversação de 10 minutos"],
		suggested_habits: ["Estudar inglês toda manhã"],
		motivation_strategies: "Definir marcos mensais.",
		chat_message_id: null,
		created_at: new Date("2024-01-01"),
		updated_at: new Date("2024-01-02"),
		...overrides,
	});

describe("GetGoalByIdUseCase", () => {
	describe("without similar goals", () => {
		it("should return goal without similar goals when similar=false", async () => {
			const goalRepository = makeMockGoalRepository();
			const goal = makeGoal();
			vi.mocked(goalRepository.findById).mockResolvedValue(goal);

			const useCase = new GetGoalByIdUseCase(
				goalRepository,
				makeMockGoalCacheService(),
				makeMockEmbeddingService(),
				makeMockGoalEmbeddingRepository(),
			);

			const result = await useCase.execute("goal-id-123", false);

			expect(result.goal).toEqual(goal);
			expect(result.similarGoals).toBeNull();
		});

		it("should return null similarGoals by default (similar not provided)", async () => {
			const goalRepository = makeMockGoalRepository();
			const goal = makeGoal();
			vi.mocked(goalRepository.findById).mockResolvedValue(goal);

			const useCase = new GetGoalByIdUseCase(
				goalRepository,
				makeMockGoalCacheService(),
				makeMockEmbeddingService(),
				makeMockGoalEmbeddingRepository(),
			);

			const result = await useCase.execute("goal-id-123");

			expect(result.similarGoals).toBeNull();
		});

		it("should call goalRepository.findById with the correct id", async () => {
			const goalRepository = makeMockGoalRepository();
			const goal = makeGoal();
			vi.mocked(goalRepository.findById).mockResolvedValue(goal);

			const useCase = new GetGoalByIdUseCase(
				goalRepository,
				makeMockGoalCacheService(),
				makeMockEmbeddingService(),
				makeMockGoalEmbeddingRepository(),
			);

			await useCase.execute("goal-id-123", false);

			expect(goalRepository.findById).toHaveBeenCalledWith("goal-id-123");
		});

		it("should throw an error when goal is not found", async () => {
			const goalRepository = makeMockGoalRepository();
			vi.mocked(goalRepository.findById).mockResolvedValue(null);

			const useCase = new GetGoalByIdUseCase(
				goalRepository,
				makeMockGoalCacheService(),
				makeMockEmbeddingService(),
				makeMockGoalEmbeddingRepository(),
			);

			await expect(useCase.execute("nonexistent-id", false)).rejects.toThrow(
				"Goal not found",
			);
		});
	});

	describe("with similar goals", () => {
		it("should return similar goals from cache when available", async () => {
			const goalRepository = makeMockGoalRepository();
			const cacheService = makeMockGoalCacheService();
			const goal = makeGoal();
			const cachedSimilarGoals: SimilarGoal[] = [];

			vi.mocked(goalRepository.findById).mockResolvedValue(goal);
			vi.mocked(cacheService.getSimilarGoals).mockResolvedValue(
				cachedSimilarGoals,
			);

			const useCase = new GetGoalByIdUseCase(
				goalRepository,
				cacheService,
				makeMockEmbeddingService(),
				makeMockGoalEmbeddingRepository(),
			);

			const result = await useCase.execute("goal-id-123", true);

			expect(result.similarGoals).toEqual(cachedSimilarGoals);
			expect(cacheService.getSimilarGoals).toHaveBeenCalledWith("goal-id-123");
		});

		it("should query embedding repository when cache misses", async () => {
			const goalRepository = makeMockGoalRepository();
			const cacheService = makeMockGoalCacheService();
			const embeddingService = makeMockEmbeddingService();
			const embeddingRepository = makeMockGoalEmbeddingRepository();
			const goal = makeGoal();

			vi.mocked(goalRepository.findById).mockResolvedValue(goal);
			vi.mocked(cacheService.getSimilarGoals).mockResolvedValue(null);
			vi.mocked(embeddingService.createEmbeddingFromText).mockResolvedValue([
				0.1, 0.2,
			]);
			vi.mocked(embeddingRepository.findSimilar).mockResolvedValue([]);

			const useCase = new GetGoalByIdUseCase(
				goalRepository,
				cacheService,
				embeddingService,
				embeddingRepository,
			);

			await useCase.execute("goal-id-123", true);

			expect(embeddingService.createEmbeddingFromText).toHaveBeenCalledWith(
				expect.stringContaining(goal.title),
			);
			expect(embeddingRepository.findSimilar).toHaveBeenCalled();
		});

		it("should cache similar goals after fetching from repository", async () => {
			const goalRepository = makeMockGoalRepository();
			const cacheService = makeMockGoalCacheService();
			const embeddingService = makeMockEmbeddingService();
			const embeddingRepository = makeMockGoalEmbeddingRepository();
			const goal = makeGoal();

			vi.mocked(goalRepository.findById).mockResolvedValue(goal);
			vi.mocked(cacheService.getSimilarGoals).mockResolvedValue(null);
			vi.mocked(embeddingService.createEmbeddingFromText).mockResolvedValue([
				0.1, 0.2,
			]);
			vi.mocked(embeddingRepository.findSimilar).mockResolvedValue([]);

			const useCase = new GetGoalByIdUseCase(
				goalRepository,
				cacheService,
				embeddingService,
				embeddingRepository,
			);

			await useCase.execute("goal-id-123", true);

			expect(cacheService.setSimilarGoals).toHaveBeenCalledWith(
				"goal-id-123",
				[],
			);
		});
	});
});
