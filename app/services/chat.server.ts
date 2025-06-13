import OpenAI from "openai";
import { z } from "zod";
import {
	ChatService,
	type ChatServiceMessage,
} from "~/features/chats/services/chat";

export const openRouterClient = new OpenAI({
	apiKey: process.env.OPEN_ROUTER_API_KEY,
	baseURL: process.env.OPEN_ROUTER_BASE_URL,
});

export class OpenRouterChatService extends ChatService {
	private readonly DEFAULT_MESSAGE_CONTENT = {
		message: "Não foi possível processar a mensagem. Tente novamente.",
	};
	private readonly MODEL = "deepseek/deepseek-r1-0528:free";
	private readonly DEFAULT_TEMPERATURE = 0.7;

	async getCompletions(messages: ChatServiceMessage[]) {
		const completion = await openRouterClient.chat.completions.create({
			model: this.MODEL,
			messages: [
				this.SYSTEM_MESSAGE,
				...messages.map((message) => ({
					role: message.role,
					content: String(message.content),
				})),
			],
			response_format: { type: "json_object" },
			temperature: this.DEFAULT_TEMPERATURE,
		});

		const choice = completion.choices[0];

		if (choice.finish_reason === "length") {
			throw new Error(
				"Response was truncated due to length limit. JSON may be incomplete.",
			);
		}

		if (choice.finish_reason === "content_filter") {
			throw new Error(
				"Response was filtered due to content policy. JSON generation was halted.",
			);
		}

		const content = choice.message.content;
		if (!content) {
			throw new Error("No content received from AI");
		}

		let jsonContent = null;

		try {
			jsonContent = JSON.parse(content);
		} catch (error) {
			jsonContent = this.DEFAULT_MESSAGE_CONTENT;
		}

		const assistantMessage = AIResponseSchema.parse(jsonContent);

		return assistantMessage;
	}
}

const GoalDataSchema = z.object({
	title: z.string().min(1, "Title cannot be empty"),
	description: z.string().min(10, "Description must be at least 10 characters"),
	estimated_time: z.string().min(1, "Estimated time cannot be empty"),
	action_steps: z
		.array(z.string().min(1, "Action step cannot be empty"))
		.min(1, "At least one action step is required"),
	progress_indicators: z
		.array(z.string().min(1, "Progress indicator cannot be empty"))
		.min(1, "At least one progress indicator is required"),
	suggested_habits: z
		.array(z.string().min(1, "Habit cannot be empty"))
		.min(1, "At least one habit is required"),
	motivation_strategies: z
		.string()
		.min(10, "Motivation strategies must be at least 10 characters"),
});

const AIResponseSchema = z.object({
	message: z.string().min(1, "Message cannot be empty"),
	data: GoalDataSchema.optional(),
});
