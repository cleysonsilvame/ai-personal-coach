import { describe, expect, it } from "vitest";
import { ChatMessage } from "./chat-message";
import type { ChatMessageContent, ChatMessageRole } from "./chat-message";

const baseContent: ChatMessageContent = {
	message: "Refinei seu objetivo de aprender inglês com um plano estruturado.",
	short_title: "Plano de Inglês",
	data: {
		title: "Desenvolver Fluência em Inglês através de Prática Estruturada",
		description:
			"Estabelecer um plano estruturado para alcançar fluência em inglês.",
		estimated_time: "12-18 meses",
		action_steps: ["Avaliar nível atual", "Estabelecer rotina de 30 minutos"],
		progress_indicators: ["Manter conversação de 10 minutos"],
		suggested_habits: ["Estudar inglês toda manhã"],
		motivation_strategies: "Definir marcos mensais com recompensas.",
	},
};

const baseChatMessageProps = {
	id: "message-id-123",
	content: baseContent,
	role: "assistant" as ChatMessageRole,
	createdAt: new Date("2024-01-01"),
	updatedAt: new Date("2024-01-02"),
	chatId: "chat-id-456",
};

describe("ChatMessage", () => {
	describe("constructor", () => {
		it("should create a chat message with all provided props", () => {
			const message = new ChatMessage(baseChatMessageProps);

			expect(message.id).toBe("message-id-123");
			expect(message.content).toEqual(baseContent);
			expect(message.role).toBe("assistant");
			expect(message.createdAt).toEqual(new Date("2024-01-01"));
			expect(message.updatedAt).toEqual(new Date("2024-01-02"));
			expect(message.chatId).toBe("chat-id-456");
		});

		it("should create a user message", () => {
			const message = new ChatMessage({
				...baseChatMessageProps,
				role: "user",
				content: { message: "quero aprender inglês fluente" },
			});

			expect(message.role).toBe("user");
			expect(message.content.message).toBe("quero aprender inglês fluente");
		});

		it("should create a system message", () => {
			const message = new ChatMessage({
				...baseChatMessageProps,
				role: "system",
				content: { message: "Você é um coach de vida experiente." },
			});

			expect(message.role).toBe("system");
		});

		it("should create message without optional data field", () => {
			const message = new ChatMessage({
				...baseChatMessageProps,
				content: { message: "Não consegui entender seu objetivo." },
			});

			expect(message.content.data).toBeUndefined();
		});

		it("should create message without optional short_title", () => {
			const message = new ChatMessage({
				...baseChatMessageProps,
				content: { message: "Olá!" },
			});

			expect(message.content.short_title).toBeUndefined();
		});
	});

	describe("static create", () => {
		it("should create a chat message with a generated UUID", () => {
			const { id, createdAt, updatedAt, ...createProps } = baseChatMessageProps;
			const message = ChatMessage.create(createProps);

			expect(message.id).toBeTruthy();
			expect(message.id.length).toBeGreaterThan(0);
			expect(message.role).toBe("assistant");
		});

		it("should generate unique IDs for different messages", () => {
			const { id, createdAt, updatedAt, ...createProps } = baseChatMessageProps;
			const message1 = ChatMessage.create(createProps);
			const message2 = ChatMessage.create(createProps);

			expect(message1.id).not.toBe(message2.id);
		});

		it("should set createdAt and updatedAt to now", () => {
			const { id, createdAt, updatedAt, ...createProps } = baseChatMessageProps;
			const before = new Date();
			const message = ChatMessage.create(createProps);
			const after = new Date();

			expect(message.createdAt.getTime()).toBeGreaterThanOrEqual(
				before.getTime(),
			);
			expect(message.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
			expect(message.updatedAt.getTime()).toBeGreaterThanOrEqual(
				before.getTime(),
			);
			expect(message.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
		});

		it("should preserve the chatId", () => {
			const { id, createdAt, updatedAt, ...createProps } = baseChatMessageProps;
			const message = ChatMessage.create(createProps);

			expect(message.chatId).toBe("chat-id-456");
		});
	});
});
