import { inject, injectable } from "inversify";
import { ChatMessageRepository } from "~/features/chats/repositories/chat-message";
import { Goal } from "../entities/goal";
import { GoalEmbedding } from "../entities/goal-embedding";
import { GoalRepository } from "../repositories/goal";
import { GoalEmbeddingRepository } from "../repositories/goal-embedding";
import { EmbeddingService } from "../services/embedding";
import { GoalCacheService } from "../services/cache";

interface CreateGoalFromMessageInput {
	messageId: string;
}

@injectable()
export class CreateGoalFromMessageUseCase {
	constructor(
		@inject(GoalRepository)
		private readonly goalRepository: GoalRepository,
		@inject(ChatMessageRepository)
		private readonly chatMessageRepository: ChatMessageRepository,
		@inject(EmbeddingService)
		private readonly embeddingService: EmbeddingService,
		@inject(GoalEmbeddingRepository)
		private readonly goalEmbeddingRepository: GoalEmbeddingRepository,
		@inject(GoalCacheService)
		private readonly goalCacheService: GoalCacheService,
	) {}

	async execute({ messageId }: CreateGoalFromMessageInput) {
		const message = await this.chatMessageRepository.findById(messageId);
		if (!message) {
			throw new Error("Mensagem não encontrada");
		}

		const content = message.content;

		if (!content.data) {
			throw new Error("Conteúdo da mensagem não encontrado");
		}

		const goal = Goal.create({
			title: content.data.title,
			description: content.data.description,
			estimated_time: content.data.estimated_time,
			action_steps: content.data.action_steps,
			progress_indicators: content.data.progress_indicators,
			suggested_habits: content.data.suggested_habits,
			motivation_strategies: content.data.motivation_strategies,
			chat_message_id: message.id,
		});

		const createdGoal = await this.goalRepository.createGoal(goal);

		// TODO: make transaction

		const markdown = createdGoal.toMarkdown();

		const embeddings =
			await this.embeddingService.createEmbeddingsFromMarkdown(markdown);

		await this.goalEmbeddingRepository.createMany(
			embeddings.map((embedding) =>
				GoalEmbedding.create({
					goal_id: createdGoal.id,
					embedding,
				}),
			),
		);

		await this.goalCacheService.invalidateAllSimilarGoals();
	}
}
