import { describe, expect, it } from "vitest";
import { Goal } from "./goal";

const baseGoalProps = {
	id: "goal-id-123",
	title: "Desenvolver Fluência em Inglês",
	description:
		"Estabelecer um plano estruturado para alcançar fluência em inglês.",
	estimated_time: "12-18 meses",
	action_steps: [
		"Avaliar nível atual",
		"Estabelecer rotina de 30 minutos",
		"Inscrever-se em curso online",
	],
	progress_indicators: [
		"Manter conversação de 10 minutos",
		"Compreender 80% de um filme",
	],
	suggested_habits: ["Estudar inglês toda manhã", "Mudar idioma do celular"],
	motivation_strategies: "Definir marcos mensais com recompensas.",
	chat_message_id: "message-id-456",
	created_at: new Date("2024-01-01"),
	updated_at: new Date("2024-01-02"),
};

describe("Goal", () => {
	describe("constructor", () => {
		it("should create a goal with all provided props", () => {
			const goal = new Goal(baseGoalProps);

			expect(goal.id).toBe("goal-id-123");
			expect(goal.title).toBe("Desenvolver Fluência em Inglês");
			expect(goal.description).toBe(
				"Estabelecer um plano estruturado para alcançar fluência em inglês.",
			);
			expect(goal.estimated_time).toBe("12-18 meses");
			expect(goal.action_steps).toEqual([
				"Avaliar nível atual",
				"Estabelecer rotina de 30 minutos",
				"Inscrever-se em curso online",
			]);
			expect(goal.progress_indicators).toEqual([
				"Manter conversação de 10 minutos",
				"Compreender 80% de um filme",
			]);
			expect(goal.suggested_habits).toEqual([
				"Estudar inglês toda manhã",
				"Mudar idioma do celular",
			]);
			expect(goal.motivation_strategies).toBe(
				"Definir marcos mensais com recompensas.",
			);
			expect(goal.chat_message_id).toBe("message-id-456");
			expect(goal.created_at).toEqual(new Date("2024-01-01"));
			expect(goal.updated_at).toEqual(new Date("2024-01-02"));
		});

		it("should create a goal without optional chat_message_id", () => {
			const goal = new Goal({ ...baseGoalProps, chat_message_id: null });
			expect(goal.chat_message_id).toBeNull();
		});

		it("should create a goal with undefined chat_message_id", () => {
			const { chat_message_id, ...propsWithoutMessageId } = baseGoalProps;
			const goal = new Goal(propsWithoutMessageId);
			expect(goal.chat_message_id).toBeUndefined();
		});
	});

	describe("static create", () => {
		it("should create a goal with a generated UUID", () => {
			const { id, created_at, updated_at, ...createProps } = baseGoalProps;
			const goal = Goal.create(createProps);

			expect(goal.id).toBeTruthy();
			expect(goal.id.length).toBeGreaterThan(0);
			expect(goal.title).toBe("Desenvolver Fluência em Inglês");
		});

		it("should generate unique IDs for different goals", () => {
			const { id, created_at, updated_at, ...createProps } = baseGoalProps;
			const goal1 = Goal.create(createProps);
			const goal2 = Goal.create(createProps);

			expect(goal1.id).not.toBe(goal2.id);
		});

		it("should set created_at and updated_at to now", () => {
			const { id, created_at, updated_at, ...createProps } = baseGoalProps;
			const before = new Date();
			const goal = Goal.create(createProps);
			const after = new Date();

			expect(goal.created_at.getTime()).toBeGreaterThanOrEqual(
				before.getTime(),
			);
			expect(goal.created_at.getTime()).toBeLessThanOrEqual(after.getTime());
			expect(goal.updated_at.getTime()).toBeGreaterThanOrEqual(
				before.getTime(),
			);
			expect(goal.updated_at.getTime()).toBeLessThanOrEqual(after.getTime());
		});
	});

	describe("removeMessageLink", () => {
		it("should set chat_message_id to null", () => {
			const goal = new Goal(baseGoalProps);
			expect(goal.chat_message_id).toBe("message-id-456");

			goal.removeMessageLink();

			expect(goal.chat_message_id).toBeNull();
		});

		it("should allow calling when chat_message_id is already null", () => {
			const goal = new Goal({ ...baseGoalProps, chat_message_id: null });
			goal.removeMessageLink();
			expect(goal.chat_message_id).toBeNull();
		});
	});

	describe("toMarkdown", () => {
		it("should generate markdown with title", () => {
			const goal = new Goal(baseGoalProps);
			const markdown = goal.toMarkdown();

			expect(markdown).toContain("# Desenvolver Fluência em Inglês");
		});

		it("should include description in markdown", () => {
			const goal = new Goal(baseGoalProps);
			const markdown = goal.toMarkdown();

			expect(markdown).toContain(
				"Estabelecer um plano estruturado para alcançar fluência em inglês.",
			);
		});

		it("should include estimated time in markdown", () => {
			const goal = new Goal(baseGoalProps);
			const markdown = goal.toMarkdown();

			expect(markdown).toContain("12-18 meses");
		});

		it("should include action steps as bullet points", () => {
			const goal = new Goal(baseGoalProps);
			const markdown = goal.toMarkdown();

			expect(markdown).toContain("- Avaliar nível atual");
			expect(markdown).toContain("- Estabelecer rotina de 30 minutos");
			expect(markdown).toContain("- Inscrever-se em curso online");
		});

		it("should include progress indicators as bullet points", () => {
			const goal = new Goal(baseGoalProps);
			const markdown = goal.toMarkdown();

			expect(markdown).toContain("- Manter conversação de 10 minutos");
			expect(markdown).toContain("- Compreender 80% de um filme");
		});

		it("should include suggested habits as bullet points", () => {
			const goal = new Goal(baseGoalProps);
			const markdown = goal.toMarkdown();

			expect(markdown).toContain("- Estudar inglês toda manhã");
			expect(markdown).toContain("- Mudar idioma do celular");
		});

		it("should include motivation strategies", () => {
			const goal = new Goal(baseGoalProps);
			const markdown = goal.toMarkdown();

			expect(markdown).toContain("Definir marcos mensais com recompensas.");
		});

		it("should show 'Nenhuma' when action_steps is empty", () => {
			const goal = new Goal({ ...baseGoalProps, action_steps: [] });
			const markdown = goal.toMarkdown();

			expect(markdown).toContain("Nenhuma");
		});

		it("should show 'Nenhum' when progress_indicators is empty", () => {
			const goal = new Goal({ ...baseGoalProps, progress_indicators: [] });
			const markdown = goal.toMarkdown();

			expect(markdown).toContain("Nenhum");
		});

		it("should show 'Nenhum' when suggested_habits is empty", () => {
			const goal = new Goal({ ...baseGoalProps, suggested_habits: [] });
			const markdown = goal.toMarkdown();

			expect(markdown).toContain("Nenhum");
		});

		it("should show 'Nenhuma' when motivation_strategies is empty", () => {
			const goal = new Goal({ ...baseGoalProps, motivation_strategies: "" });
			const markdown = goal.toMarkdown();

			expect(markdown).toContain("Nenhuma");
		});

		it("should include all required section headers", () => {
			const goal = new Goal(baseGoalProps);
			const markdown = goal.toMarkdown();

			expect(markdown).toContain("## Etapas de Ação");
			expect(markdown).toContain("## Indicadores de Progresso");
			expect(markdown).toContain("## Hábitos Sugeridos");
			expect(markdown).toContain("## Estratégias de Motivação");
		});
	});
});
