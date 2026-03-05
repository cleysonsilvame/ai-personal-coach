import { describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "~/features/chats/entities/chat-message";
import type { GoalAggregate } from "../aggregates/goal-aggregate";
import { Goal } from "../entities/goal";
import type { GoalRepository } from "../repositories/goal";
import { GetGoalsUseCase } from "./get-goals.server";

const makeMockGoalRepository = (): GoalRepository => ({
	setTransaction: vi.fn().mockReturnThis(),
	createGoal: vi.fn(),
	findById: vi.fn(),
	findAll: vi.fn(),
	deleteById: vi.fn(),
	updateById: vi.fn(),
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

describe("GetGoalsUseCase", () => {
	it("should return all goals from repository with chatMessage include", async () => {
		const goalRepository = makeMockGoalRepository();
		const goals = [
			makeGoal({ id: "goal-1", title: "Plano de Inglês" }),
			makeGoal({ id: "goal-2", title: "Saúde e Bem-estar" }),
		] as GoalAggregate<ChatMessage | null>[];
		vi.mocked(goalRepository.findAll).mockResolvedValue(goals);

		const useCase = new GetGoalsUseCase(goalRepository);
		const result = await useCase.execute();

		expect(result).toHaveLength(2);
		expect(result[0].title).toBe("Plano de Inglês");
		expect(result[1].title).toBe("Saúde e Bem-estar");
	});

	it("should call findAll with chatMessage include option", async () => {
		const goalRepository = makeMockGoalRepository();
		vi.mocked(goalRepository.findAll).mockResolvedValue([]);

		const useCase = new GetGoalsUseCase(goalRepository);
		await useCase.execute();

		expect(goalRepository.findAll).toHaveBeenCalledWith({ chatMessage: true });
	});

	it("should return empty array when no goals exist", async () => {
		const goalRepository = makeMockGoalRepository();
		vi.mocked(goalRepository.findAll).mockResolvedValue([]);

		const useCase = new GetGoalsUseCase(goalRepository);
		const result = await useCase.execute();

		expect(result).toHaveLength(0);
	});

	it("should propagate errors from the repository", async () => {
		const goalRepository = makeMockGoalRepository();
		vi.mocked(goalRepository.findAll).mockRejectedValue(
			new Error("Database error"),
		);

		const useCase = new GetGoalsUseCase(goalRepository);

		await expect(useCase.execute()).rejects.toThrow("Database error");
	});
});
