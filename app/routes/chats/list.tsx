import { ChatsList } from "~/features/chats/views/chats-list";
import { container } from "~/lib/container";
import type { Route } from "./+types/list";
import { z } from "zod";
import { GetChatsListUseCase } from "~/features/chats/use-cases/get-chats-list.server";
import { UpdateChatUseCase } from "~/features/chats/use-cases/update-chat.server";
import { DeleteChatUseCase } from "~/features/chats/use-cases/delete-chat.server";

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
				const updateChatUseCase = container.get(UpdateChatUseCase);
				await updateChatUseCase.execute({ chatId: data.chat_id, title: data.title });
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
				const deleteChatUseCase = container.get(DeleteChatUseCase);
				await deleteChatUseCase.execute({ chatId: data.chat_id });
				return { success: true };
			} catch (error) {
				return { success: false, error: "Erro ao deletar chat" };
			}
		}
	}
}

export async function loader() {
	const getChatsListUseCase = container.get(GetChatsListUseCase);
	const { chats } = await getChatsListUseCase.execute();
	return { chats };
}

export default function () {
	return <ChatsList />;
}
