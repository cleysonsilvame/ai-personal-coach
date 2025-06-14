import { Container } from "inversify";
import { PrismaChatRepository } from "~/database/chat.repository";
import { PrismaGoalRepository } from "~/database/goal.repository";
import { ChatRepository } from "~/features/chats/repositories/chat";
import { ChatService } from "~/features/chats/services/chat";
import { GoalRepository } from "~/features/goals/repositories/goal";
import { OpenRouterChatService } from "~/services/chat.server";

const container = new Container({
	autobind: true,
});

container.bind(ChatRepository).to(PrismaChatRepository).inSingletonScope();
container.bind(ChatService).to(OpenRouterChatService).inSingletonScope();
container.bind(GoalRepository).to(PrismaGoalRepository).inSingletonScope();

export { container };
