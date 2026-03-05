import { describe, expect, it } from "vitest";
import { Chat } from "../entities/chat";
import { ChatMapper } from "./chat";

describe("ChatMapper", () => {
	describe("toDomain", () => {
		it("should map chat props to a Chat entity", () => {
			const chatProps = {
				id: "chat-id-123",
				title: "Meu plano de inglês",
				created_at: new Date("2024-01-01"),
				updated_at: new Date("2024-01-02"),
			};

			const chat = ChatMapper.toDomain(chatProps);

			expect(chat).toBeInstanceOf(Chat);
			expect(chat.id).toBe("chat-id-123");
			expect(chat.title).toBe("Meu plano de inglês");
			expect(chat.created_at).toEqual(new Date("2024-01-01"));
			expect(chat.updated_at).toEqual(new Date("2024-01-02"));
		});

		it("should map a chat with an empty title", () => {
			const chatProps = {
				id: "chat-id-456",
				title: "",
				created_at: new Date("2024-01-01"),
				updated_at: new Date("2024-01-01"),
			};

			const chat = ChatMapper.toDomain(chatProps);

			expect(chat).toBeInstanceOf(Chat);
			expect(chat.title).toBe("");
		});

		it("should produce a Chat entity with all original props preserved", () => {
			const chatProps = {
				id: "specific-id",
				title: "Saúde e bem-estar",
				created_at: new Date("2023-06-15"),
				updated_at: new Date("2023-12-31"),
			};

			const chat = ChatMapper.toDomain(chatProps);

			expect(chat.id).toBe(chatProps.id);
			expect(chat.title).toBe(chatProps.title);
			expect(chat.created_at).toEqual(chatProps.created_at);
			expect(chat.updated_at).toEqual(chatProps.updated_at);
		});
	});
});
