import { inject, injectable } from "inversify";
import { z } from "zod";
import OpenAI from "openai";
import { ChatMessage } from "~/features/chats/entities/chat-message";
import { ChatService } from "~/features/chats/services/chat";
import { Config } from "~/lib/config";
import { ProviderSelectionService } from "./provider-selection.server";

@injectable()
export class OpenRouterChatService extends ChatService {
	private readonly DEFAULT_MESSAGE_CONTENT = {
		message: "Não foi possível processar a mensagem. Tente novamente.",
	};

	private readonly openRouterClient: OpenAI;

	constructor(
		@inject(Config) private readonly config: Config,
		@inject(ProviderSelectionService)
		private readonly providerSelection: ProviderSelectionService,
	) {
		super();
		this.openRouterClient = new OpenAI({
			apiKey: this.config.env.OPEN_ROUTER_API_KEY,
			baseURL: this.config.env.OPEN_ROUTER_BASE_URL,
		});
	}

	async getCompletions(messages: ChatMessage[]): Promise<ChatMessage> {
		const models = this.providerSelection.getModelsForUseCase("chat");
		let lastError: Error | null = null;

		// Try each model in order of preference
		for (const model of models) {
			try {
				const completion = await this.openRouterClient.chat.completions.create({
					model,
					messages: [
						this.SYSTEM_MESSAGE,
						...messages.map((message) => ({
							role: message.role,
							content: message.content.message,
						})),
					],
					response_format: { type: "json_object" },
					temperature: this.config.env.OPEN_ROUTER_TEMPERATURE,
				});

				return this.processCompletion(completion, messages[0].chatId);
			} catch (error: unknown) {
				lastError = error as Error;

				// If model is unavailable, try the next one
				if (this.providerSelection.isModelUnavailableError(error)) {
					console.warn(`Model ${model} is unavailable, trying fallback...`);
					continue;
				}

				// For other errors, throw immediately
				throw error;
			}
		}

		// If all models failed, throw the last error
		throw lastError || new Error("All models failed");
	}

	private processCompletion(
		completion: OpenAI.Chat.Completions.ChatCompletion,
		chatId: string,
	): ChatMessage {

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

		const assistantMessage = AIResponseSchema.safeParse(jsonContent);

		if (!assistantMessage.success) {
			console.log(jsonContent);
			throw assistantMessage.error;
		}

		return ChatMessage.create({
			content: assistantMessage.data,
			role: "assistant",
			chatId: chatId,
		});
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
	short_title: z.string().optional().default("Sem título"),
	data: GoalDataSchema.optional()
		.nullable()
		.or(z.object({}))
		.transform((data) => {
			if (data === null) return undefined;
			if (data && !("title" in data)) return undefined;

			return data;
		}),
});
