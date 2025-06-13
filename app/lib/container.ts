import { Container } from "inversify";
import { PrismaChatRepository } from "~/database/chat.repository";
import { ChatRepository } from "~/features/goals/repositories/chat";
import { ChatService } from "~/features/goals/services/chat";
import { OpenRouterChatService } from "~/services/chat.server";

const container = new Container({
	autobind: true,
});

container.bind(ChatRepository).to(PrismaChatRepository).inSingletonScope();
container.bind(ChatService).to(OpenRouterChatService).inSingletonScope();

export { container };
