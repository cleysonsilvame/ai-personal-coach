import { describe, expect, it } from "vitest";
import { Goal } from "../entities/goal";
import { GoalsMapper } from "./goals";

const dbGoalRecord = {
	id: "goal-db-id-123",
	title: "Desenvolver Fluência em Inglês",
	description:
		"Estabelecer um plano estruturado para alcançar fluência em inglês.",
	estimated_time: "12-18 meses",
	action_steps: ["Avaliar nível atual", "Estabelecer rotina de 30 minutos"],
	progress_indicators: ["Manter conversação de 10 minutos"],
	suggested_habits: ["Estudar inglês toda manhã"],
	motivation_strategies: "Definir marcos mensais com recompensas.",
	chat_message_id: "message-id-456",
	created_at: new Date("2024-01-01"),
	updated_at: new Date("2024-01-02"),
};

const goalEntity = new Goal({
	id: "goal-entity-id-123",
	title: "Desenvolver Fluência em Inglês",
	description:
		"Estabelecer um plano estruturado para alcançar fluência em inglês.",
	estimated_time: "12-18 meses",
	action_steps: ["Avaliar nível atual", "Estabelecer rotina de 30 minutos"],
	progress_indicators: ["Manter conversação de 10 minutos"],
	suggested_habits: ["Estudar inglês toda manhã"],
	motivation_strategies: "Definir marcos mensais com recompensas.",
	chat_message_id: "message-id-456",
	created_at: new Date("2024-01-01"),
	updated_at: new Date("2024-01-02"),
});

describe("GoalsMapper", () => {
	describe("toDomain", () => {
		it("should map a database record to a Goal entity", () => {
			const goal = GoalsMapper.toDomain(dbGoalRecord);

			expect(goal).toBeInstanceOf(Goal);
			expect(goal.id).toBe("goal-db-id-123");
			expect(goal.title).toBe("Desenvolver Fluência em Inglês");
			expect(goal.description).toBe(
				"Estabelecer um plano estruturado para alcançar fluência em inglês.",
			);
			expect(goal.estimated_time).toBe("12-18 meses");
			expect(goal.action_steps).toEqual([
				"Avaliar nível atual",
				"Estabelecer rotina de 30 minutos",
			]);
			expect(goal.progress_indicators).toEqual([
				"Manter conversação de 10 minutos",
			]);
			expect(goal.suggested_habits).toEqual(["Estudar inglês toda manhã"]);
			expect(goal.motivation_strategies).toBe(
				"Definir marcos mensais com recompensas.",
			);
			expect(goal.chat_message_id).toBe("message-id-456");
			expect(goal.created_at).toEqual(new Date("2024-01-01"));
			expect(goal.updated_at).toEqual(new Date("2024-01-02"));
		});

		it("should map a record with null chat_message_id", () => {
			const goal = GoalsMapper.toDomain({
				...dbGoalRecord,
				chat_message_id: null,
			});

			expect(goal.chat_message_id).toBeNull();
		});
	});

	describe("toPersistence", () => {
		it("should map a Goal entity to persistence format", () => {
			const persistence = GoalsMapper.toPersistence(goalEntity);

			expect(persistence.id).toBe("goal-entity-id-123");
			expect(persistence.title).toBe("Desenvolver Fluência em Inglês");
			expect(persistence.description).toBe(
				"Estabelecer um plano estruturado para alcançar fluência em inglês.",
			);
			expect(persistence.estimated_time).toBe("12-18 meses");
			expect(persistence.action_steps).toEqual([
				"Avaliar nível atual",
				"Estabelecer rotina de 30 minutos",
			]);
			expect(persistence.progress_indicators).toEqual([
				"Manter conversação de 10 minutos",
			]);
			expect(persistence.suggested_habits).toEqual([
				"Estudar inglês toda manhã",
			]);
			expect(persistence.motivation_strategies).toBe(
				"Definir marcos mensais com recompensas.",
			);
			expect(persistence.chat_message_id).toBe("message-id-456");
			expect(persistence.created_at).toEqual(new Date("2024-01-01"));
			expect(persistence.updated_at).toEqual(new Date("2024-01-02"));
		});

		it("should preserve null chat_message_id in persistence", () => {
			const goalWithNoMessage = new Goal({
				...goalEntity,
				chat_message_id: null,
			});
			const persistence = GoalsMapper.toPersistence(goalWithNoMessage);

			expect(persistence.chat_message_id).toBeNull();
		});
	});

	describe("toUpdatePersistence", () => {
		it("should map update input to partial persistence format", () => {
			const updateInput = {
				title: "Novo Título",
				description: "Nova descrição",
				estimated_time: "6 meses",
				action_steps: ["Passo 1", "Passo 2"],
				progress_indicators: ["Indicador 1"],
				suggested_habits: ["Hábito 1"],
				motivation_strategies: "Nova estratégia",
				chat_message_id: null,
				updated_at: new Date("2024-06-01"),
			};

			const result = GoalsMapper.toUpdatePersistence(updateInput);

			expect(result.title).toBe("Novo Título");
			expect(result.description).toBe("Nova descrição");
			expect(result.estimated_time).toBe("6 meses");
			expect(result.action_steps).toEqual(["Passo 1", "Passo 2"]);
			expect(result.progress_indicators).toEqual(["Indicador 1"]);
			expect(result.suggested_habits).toEqual(["Hábito 1"]);
			expect(result.motivation_strategies).toBe("Nova estratégia");
			expect(result.chat_message_id).toBeNull();
			expect(result.updated_at).toEqual(new Date("2024-06-01"));
		});

		it("should not include id in update persistence", () => {
			const updateInput = {
				title: "Novo Título",
				description: "Nova descrição",
				estimated_time: "6 meses",
				action_steps: [],
				progress_indicators: [],
				suggested_habits: [],
				motivation_strategies: "",
				chat_message_id: null,
				updated_at: new Date(),
			};

			const result = GoalsMapper.toUpdatePersistence(updateInput);

			expect(result).not.toHaveProperty("id");
			expect(result).not.toHaveProperty("created_at");
		});
	});

	describe("toHtml", () => {
		it("should map a Goal entity to HTML-compatible format", () => {
			const html = GoalsMapper.toHtml(goalEntity);

			expect(html.id).toBe("goal-entity-id-123");
			expect(html.title).toBe("Desenvolver Fluência em Inglês");
			expect(html.description).toBe(
				"Estabelecer um plano estruturado para alcançar fluência em inglês.",
			);
			expect(html.estimated_time).toBe("12-18 meses");
			expect(html.action_steps).toEqual([
				"Avaliar nível atual",
				"Estabelecer rotina de 30 minutos",
			]);
			expect(html.progress_indicators).toEqual([
				"Manter conversação de 10 minutos",
			]);
			expect(html.suggested_habits).toEqual(["Estudar inglês toda manhã"]);
			expect(html.motivation_strategies).toBe(
				"Definir marcos mensais com recompensas.",
			);
		});

		it("should format created_at as localized string", () => {
			const html = GoalsMapper.toHtml(goalEntity);
			expect(typeof html.created_at).toBe("string");
			expect(html.created_at.length).toBeGreaterThan(0);
		});

		it("should format updated_at as localized string", () => {
			const html = GoalsMapper.toHtml(goalEntity);
			expect(typeof html.updated_at).toBe("string");
			expect(html.updated_at.length).toBeGreaterThan(0);
		});

		it("should return null for chat_id when goal has no aggregate message", () => {
			const html = GoalsMapper.toHtml(goalEntity);
			expect(html.chat_id).toBeNull();
		});
	});
});
