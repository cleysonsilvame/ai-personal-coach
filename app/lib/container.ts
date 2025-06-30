import { Container } from "inversify";
import { PrismaChatMessageRepository } from "~/database/prisma/chat-message.repository";
import { PrismaChatRepository } from "~/database/prisma/chat.repository";
import { PrismaGoalEmbeddingRepository } from "~/database/prisma/goal-embedding.repository";
import { PrismaGoalRepository } from "~/database/prisma/goal.repository";
import { ChatRepository } from "~/features/chats/repositories/chat";
import { ChatMessageRepository } from "~/features/chats/repositories/chat-message";
import { ChatService } from "~/features/chats/services/chat";
import { GoalRepository } from "~/features/goals/repositories/goal";
import { GoalEmbeddingRepository } from "~/features/goals/repositories/goal-embedding";
import { GoalCacheService } from "~/features/goals/services/cache";
import { EmbeddingService } from "~/features/goals/services/embedding";
import { RedisGoalCacheService } from "~/services/cache.server";
import { OpenRouterChatService } from "~/services/chat.server";
import { PrismaUnitOfWork } from "~/database/prisma/unit-of-work.server";
import { GeminiEmbeddingService } from "~/services/embedding.server";
import { UnitOfWork } from "~/features/core/services/unit-of-work";
import { DrizzleChatRepository } from "~/database/drizzle/chat.repository";

export const container = new Container({
	autobind: true,
});

// Prisma
// container.bind(ChatRepository).to(PrismaChatRepository).inTransientScope();
// container.bind(GoalRepository).to(PrismaGoalRepository).inTransientScope();
// container
// 	.bind(ChatMessageRepository)
// 	.to(PrismaChatMessageRepository)
// 	.inTransientScope();
// container
// 	.bind(GoalEmbeddingRepository)
// 	.to(PrismaGoalEmbeddingRepository)
// 	.inTransientScope();

// container.bind(UnitOfWork).to(PrismaUnitOfWork).inSingletonScope();

// Drizzle
container.bind(ChatRepository).to(DrizzleChatRepository).inTransientScope();

container.bind(ChatService).to(OpenRouterChatService).inSingletonScope();
container.bind(EmbeddingService).to(GeminiEmbeddingService).inSingletonScope();
container.bind(GoalCacheService).to(RedisGoalCacheService).inSingletonScope();
