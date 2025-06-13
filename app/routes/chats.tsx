import { ChatRepository } from "~/features/goals/repositories/chat";
import { ChatsList } from "~/features/tasks/chats-list";
import { container } from "~/lib/container";
import { prisma } from "~/lib/prisma-client";
import type { Route } from "./+types/chats";

export async function loader() {
	return { chats: await prisma.chat.findMany() };
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	switch (formData.get("action")) {
		case "deleteChat": {
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
		case "updateChat": {
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
	}
}

export default function () {
	return <ChatsList />;
}
