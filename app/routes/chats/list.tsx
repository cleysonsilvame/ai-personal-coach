import { ChatRepository } from "~/features/chats/repositories/chat";
import { ChatsList } from "~/features/chats/chats-list";
import { container } from "~/lib/container";
import type { Route } from "./+types/list";

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	switch (request.method) {
		case "PATCH": {
			const chatId = formData.get("chat_id") as string;
			const title = formData.get("title") as string;

			if (!chatId) {
				return { success: false, error: "Dados inválidos" };
			}

			try {
				const chatRepository = container.get(ChatRepository);
				await chatRepository.update(chatId, title);
				return { success: true };
			} catch (error) {
				return { success: false, error: "Erro ao atualizar chat" };
			}
		}

		case "DELETE": {
			const chatId = formData.get("chat_id") as string;
			if (!chatId) {
				return { success: false, error: "Dados inválidos" };
			}
			try {
				const chatRepository = container.get(ChatRepository);
				await chatRepository.deleteChat(chatId);
				return { success: true };
			} catch (error) {
				return { success: false, error: "Erro ao deletar chat" };
			}
		}
	}
}

export async function loader() {
	const chatRepository = container.get(ChatRepository);
	const chats = await chatRepository.findAll();
	return { chats };
}

export default function () {
	return <ChatsList />;
}
