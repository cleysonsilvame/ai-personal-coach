import type { ChatMessageRole } from "generated/prisma";

export interface ChatMessageContent {
	message: string;
	data?: {
		title: string;
		description: string;
		estimated_time: string;
		action_steps: string[];
		progress_indicators: string[];
		suggested_habits: string[];
		motivation_strategies: string;
	};
}

interface ChatMessageProps {
	id: string;
	content: ChatMessageContent;
	role: ChatMessageRole;
	createdAt: Date;
	updatedAt: Date;
}

export class ChatMessage {
	readonly id: string;
	readonly content: ChatMessageContent;
	readonly role: ChatMessageRole;
	readonly createdAt: Date;
	readonly updatedAt: Date;

	constructor(props: ChatMessageProps) {
		this.id = props.id;
		this.content = props.content;
		this.role = props.role;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
	}

	static create(
		props: Omit<ChatMessageProps, "id" | "createdAt" | "updatedAt">,
	) {
		return new ChatMessage({
			...props,
			id: crypto.randomUUID(),
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	}
}
