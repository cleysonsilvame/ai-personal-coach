import { Container } from "inversify";
import { PrismaChatMessageRepository } from "~/database/chat-message.repository";
import { PrismaChatRepository } from "~/database/chat.repository";
import { PrismaGoalRepository } from "~/database/goal.repository";
import { ChatRepository } from "~/features/chats/repositories/chat";
import { ChatMessageRepository } from "~/features/chats/repositories/chat-message";
import { ChatService } from "~/features/chats/services/chat";
import { GoalRepository } from "~/features/goals/repositories/goal";
import { OpenRouterChatService } from "~/services/chat.server";

export const container = new Container({
	autobind: true,
});

container.bind(ChatRepository).to(PrismaChatRepository).inSingletonScope();
container.bind(ChatService).to(OpenRouterChatService).inSingletonScope();
container.bind(GoalRepository).to(PrismaGoalRepository).inSingletonScope();
container
	.bind(ChatMessageRepository)
	.to(PrismaChatMessageRepository)
	.inSingletonScope();
