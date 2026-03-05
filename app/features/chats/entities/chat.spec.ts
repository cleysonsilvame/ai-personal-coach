import { describe, expect, it } from "vitest";
import { Chat } from "./chat";

describe("Chat", () => {
	const baseChatProps = {
		id: "chat-id-123",
		title: "Meu plano de inglês",
		created_at: new Date("2024-01-01"),
		updated_at: new Date("2024-01-02"),
	};

	describe("constructor", () => {
		it("should create a chat with all provided props", () => {
			const chat = new Chat(baseChatProps);

			expect(chat.id).toBe("chat-id-123");
			expect(chat.title).toBe("Meu plano de inglês");
			expect(chat.created_at).toEqual(new Date("2024-01-01"));
			expect(chat.updated_at).toEqual(new Date("2024-01-02"));
		});

		it("should create a chat with an empty title", () => {
			const chat = new Chat({ ...baseChatProps, title: "" });
			expect(chat.title).toBe("");
		});
	});

	describe("static create", () => {
		it("should create a chat with a generated UUID", () => {
			const { id, created_at, ...createProps } = baseChatProps;
			const chat = Chat.create(createProps);

			expect(chat.id).toBeTruthy();
			expect(chat.id.length).toBeGreaterThan(0);
			expect(chat.title).toBe("Meu plano de inglês");
		});

		it("should generate unique IDs for different chats", () => {
			const { id, created_at, ...createProps } = baseChatProps;
			const chat1 = Chat.create(createProps);
			const chat2 = Chat.create(createProps);

			expect(chat1.id).not.toBe(chat2.id);
		});

		it("should set created_at to now", () => {
			const { id, created_at, ...createProps } = baseChatProps;
			const before = new Date();
			const chat = Chat.create(createProps);
			const after = new Date();

			expect(chat.created_at.getTime()).toBeGreaterThanOrEqual(
				before.getTime(),
			);
			expect(chat.created_at.getTime()).toBeLessThanOrEqual(after.getTime());
		});

		it("should set updated_at to now", () => {
			const { id, created_at, ...createProps } = baseChatProps;
			const before = new Date();
			const chat = Chat.create(createProps);
			const after = new Date();

			expect(chat.updated_at.getTime()).toBeGreaterThanOrEqual(
				before.getTime(),
			);
			expect(chat.updated_at.getTime()).toBeLessThanOrEqual(after.getTime());
		});
	});
});
