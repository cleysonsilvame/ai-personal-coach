import { describe, expect, it, vi } from "vitest";
import type { Transaction } from "~/features/core/services/transaction";
import type { UnitOfWork } from "~/features/core/services/unit-of-work";
import type { GoalRepository } from "../repositories/goal";
import type { GoalCacheService } from "../services/cache";
import { DeleteGoalUseCase } from "./delete-goal.server";

const makeMockGoalRepository = (): GoalRepository => ({
	setTransaction: vi.fn().mockReturnThis(),
	createGoal: vi.fn(),
	findById: vi.fn(),
	findAll: vi.fn(),
	deleteById: vi.fn().mockResolvedValue(undefined),
	updateById: vi.fn(),
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

describe("DeleteGoalUseCase", () => {
	it("should delete the goal by id", async () => {
		const goalRepository = makeMockGoalRepository();
		const goalCacheService = makeMockGoalCacheService();
		const uow = makeMockUnitOfWork();

		const useCase = new DeleteGoalUseCase(
			goalRepository,
			goalCacheService,
			uow,
		);
		await useCase.execute("goal-id-123");

		expect(goalRepository.deleteById).toHaveBeenCalledWith("goal-id-123");
	});

	it("should call setTransaction within unit of work", async () => {
		const goalRepository = makeMockGoalRepository();
		const goalCacheService = makeMockGoalCacheService();
		const uow = makeMockUnitOfWork();

		const useCase = new DeleteGoalUseCase(
			goalRepository,
			goalCacheService,
			uow,
		);
		await useCase.execute("goal-id-123");

		expect(goalRepository.setTransaction).toHaveBeenCalledOnce();
	});

	it("should invalidate all similar goals cache after deletion", async () => {
		const goalRepository = makeMockGoalRepository();
		const goalCacheService = makeMockGoalCacheService();
		const uow = makeMockUnitOfWork();

		const useCase = new DeleteGoalUseCase(
			goalRepository,
			goalCacheService,
			uow,
		);
		await useCase.execute("goal-id-123");

		expect(goalCacheService.invalidateAllSimilarGoals).toHaveBeenCalledOnce();
	});

	it("should execute within a unit of work transaction", async () => {
		const goalRepository = makeMockGoalRepository();
		const goalCacheService = makeMockGoalCacheService();
		const uow = makeMockUnitOfWork();

		const useCase = new DeleteGoalUseCase(
			goalRepository,
			goalCacheService,
			uow,
		);
		await useCase.execute("goal-id-123");

		expect(uow.execute).toHaveBeenCalledOnce();
	});

	it("should propagate errors from the repository", async () => {
		const goalRepository = makeMockGoalRepository();
		const goalCacheService = makeMockGoalCacheService();
		const uow = makeMockUnitOfWork();

		vi.mocked(goalRepository.deleteById).mockRejectedValue(
			new Error("Database error"),
		);

		const useCase = new DeleteGoalUseCase(
			goalRepository,
			goalCacheService,
			uow,
		);

		await expect(useCase.execute("goal-id-123")).rejects.toThrow(
			"Database error",
		);
	});
});
