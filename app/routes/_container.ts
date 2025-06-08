import { Container } from "inversify";
import { PrismaChatRepository } from "~/database/chat.repository";
import { ChatRepository } from "~/features/goals/repositories/chat";

const container = new Container({
	autobind: true,
});

container.bind(ChatRepository).to(PrismaChatRepository).inSingletonScope();

export { container };
