import { Container } from "inversify";
import { DrizzleChatMessageRepository } from "~/database/drizzle/chat-message.repository";
import { DrizzleChatRepository } from "~/database/drizzle/chat.repository";
import { DrizzleGoalEmbeddingRepository } from "~/database/drizzle/goal-embedding.repository";
import { DrizzleGoalRepository } from "~/database/drizzle/goal.repository";
import { DrizzleUnitOfWork } from "~/database/drizzle/unit-of-work.server";
import { ChatRepository } from "~/features/chats/repositories/chat";
import { ChatMessageRepository } from "~/features/chats/repositories/chat-message";
import { ChatService } from "~/features/chats/services/chat";
import { UnitOfWork } from "~/features/core/services/unit-of-work";
import { GoalRepository } from "~/features/goals/repositories/goal";
import { GoalEmbeddingRepository } from "~/features/goals/repositories/goal-embedding";
import { GoalCacheService } from "~/features/goals/services/cache";
import { EmbeddingService } from "~/features/goals/services/embedding";
import { RedisGoalCacheService } from "~/services/cache.server";
import { OpenRouterChatService } from "~/services/chat.server";
import { GeminiEmbeddingService } from "~/services/embedding.server";

export const container = new Container({
	autobind: true,
});

container.bind(ChatRepository).to(DrizzleChatRepository).inTransientScope();
container
	.bind(ChatMessageRepository)
	.to(DrizzleChatMessageRepository)
	.inTransientScope();
container.bind(GoalRepository).to(DrizzleGoalRepository).inTransientScope();
container
	.bind(GoalEmbeddingRepository)
	.to(DrizzleGoalEmbeddingRepository)
	.inTransientScope();
container.bind(UnitOfWork).to(DrizzleUnitOfWork).inSingletonScope();

container.bind(ChatService).to(OpenRouterChatService).inSingletonScope();
container.bind(EmbeddingService).to(GeminiEmbeddingService).inSingletonScope();
container.bind(GoalCacheService).to(RedisGoalCacheService).inSingletonScope();
