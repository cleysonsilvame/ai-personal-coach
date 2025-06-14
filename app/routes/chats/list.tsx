import { ChatRepository } from "~/features/chats/repositories/chat";
import { ChatsList } from "~/features/chats/chats-list";
import { container } from "~/lib/container";
import type { Route } from "./+types/list";
import { z } from "zod";

const patchSchema = z.object({
	chat_id: z.string().uuid(),
	title: z.string().trim().min(1).max(255),
});

const deleteSchema = z.object({
	chat_id: z.string().uuid(),
});

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	switch (request.method) {
		case "PATCH": {
			const { success, data } = patchSchema.safeParse(
				Object.fromEntries(formData.entries()),
			);

			if (!success) {
				return { success: false, error: "Dados inválidos" };
			}

			try {
				const chatRepository = container.get(ChatRepository);
				await chatRepository.update(data.chat_id, data.title);
				return { success: true };
			} catch (error) {
				return { success: false, error: "Erro ao atualizar chat" };
			}
		}

		case "DELETE": {
			const { success, data } = deleteSchema.safeParse(
				Object.fromEntries(formData.entries()),
			);

			if (!success) {
				return { success: false, error: "Dados inválidos" };
			}

			try {
				const chatRepository = container.get(ChatRepository);
				await chatRepository.deleteChat(data.chat_id);
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
