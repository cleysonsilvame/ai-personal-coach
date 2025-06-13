import { Container } from "inversify";
import { PrismaChatRepository } from "~/database/chat.repository";
import { ChatRepository } from "~/features/chats/repositories/chat";
import { ChatService } from "~/features/chats/services/chat";
import { OpenRouterChatService } from "~/services/chat.server";

const container = new Container({
	autobind: true,
});

container.bind(ChatRepository).to(PrismaChatRepository).inSingletonScope();
container.bind(ChatService).to(OpenRouterChatService).inSingletonScope();

export { container };
