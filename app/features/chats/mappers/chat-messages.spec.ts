import { describe, expect, it } from "vitest";
import { ChatMessage } from "../entities/chat-message";
import { ChatMessagesMapper } from "./chat-messages";

const dbMessageRecord = {
	id: "message-id-123",
	content: {
		message: "Refinei seu objetivo de aprender inglês.",
		short_title: "Plano de Inglês",
		data: {
			title: "Desenvolver Fluência em Inglês",
			description: "Plano estruturado para alcançar fluência.",
			estimated_time: "12-18 meses",
			action_steps: ["Avaliar nível atual", "Estudar 30 minutos por dia"],
			progress_indicators: ["Manter conversação de 10 minutos"],
			suggested_habits: ["Estudar inglês toda manhã"],
			motivation_strategies: "Definir marcos mensais com recompensas.",
		},
	},
	role: "assistant" as const,
	chat_id: "chat-id-456",
	created_at: new Date("2024-01-01"),
	updated_at: new Date("2024-01-02"),
};

describe("ChatMessagesMapper", () => {
	describe("toDomain", () => {
		it("should map a database record to a ChatMessage entity", () => {
			const message = ChatMessagesMapper.toDomain(dbMessageRecord);

			expect(message).toBeInstanceOf(ChatMessage);
			expect(message.id).toBe("message-id-123");
			expect(message.role).toBe("assistant");
			expect(message.chatId).toBe("chat-id-456");
			expect(message.createdAt).toEqual(new Date("2024-01-01"));
			expect(message.updatedAt).toEqual(new Date("2024-01-02"));
		});

		it("should map content with data field", () => {
			const message = ChatMessagesMapper.toDomain(dbMessageRecord);

			expect(message.content.message).toBe(
				"Refinei seu objetivo de aprender inglês.",
			);
			expect(message.content.data?.title).toBe(
				"Desenvolver Fluência em Inglês",
			);
			expect(message.content.data?.estimated_time).toBe("12-18 meses");
			expect(message.content.data?.action_steps).toEqual([
				"Avaliar nível atual",
				"Estudar 30 minutos por dia",
			]);
		});

		it("should map a record without data field (error response)", () => {
			const errorRecord = {
				...dbMessageRecord,
				content: {
					message: "Não consegui entender seu objetivo.",
				},
			};

			const message = ChatMessagesMapper.toDomain(errorRecord);

			expect(message.content.message).toBe(
				"Não consegui entender seu objetivo.",
			);
			expect(message.content.data).toBeUndefined();
		});

		it("should map a user role message", () => {
			const userRecord = {
				...dbMessageRecord,
				role: "user" as const,
				content: { message: "quero aprender inglês fluente" },
			};

			const message = ChatMessagesMapper.toDomain(userRecord);

			expect(message.role).toBe("user");
			expect(message.content.message).toBe("quero aprender inglês fluente");
		});

		it("should throw a Zod validation error for invalid content format (empty message)", () => {
			const invalidRecord = {
				...dbMessageRecord,
				content: { message: "" },
			};

			expect(() => ChatMessagesMapper.toDomain(invalidRecord)).toThrow(
				"Message cannot be empty",
			);
		});
	});

	describe("toHtml", () => {
		it("should parse and sanitize markdown message", () => {
			const message = new ChatMessage({
				id: "msg-id",
				content: { message: "**Seu plano foi refinado!**" },
				role: "assistant",
				createdAt: new Date(),
				updatedAt: new Date(),
				chatId: "chat-id",
			});

			const result = ChatMessagesMapper.toHtml(message);

			expect(result).toBe(message);
			expect(result.content.message).toContain("<strong>");
		});

		it("should sanitize potentially unsafe HTML in messages", () => {
			const message = new ChatMessage({
				id: "msg-id",
				content: {
					message: 'Hello <script>alert("xss")</script>',
				},
				role: "assistant",
				createdAt: new Date(),
				updatedAt: new Date(),
				chatId: "chat-id",
			});

			const result = ChatMessagesMapper.toHtml(message);

			expect(result.content.message).not.toContain("<script>");
			expect(result.content.message).not.toContain("alert");
		});
	});
});
