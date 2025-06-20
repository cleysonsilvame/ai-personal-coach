import { redirect } from "react-router";
import { z } from "zod";
import { ChatInterface } from "~/features/chats/views/chat-interface";
import { GoalContent } from "~/features/chats/views/goal-content";
import { container } from "../../lib/container";
import type { Route } from "./+types/new";
import { SendMessageUseCase } from "~/features/chats/use-cases/send-message.server";
import { GetChatMessagesUseCase } from "~/features/chats/use-cases/get-chat-messages.server";

const actionSchema = z.object({
	message: z.string().trim().min(1),
	chatId: z.string().uuid().nullable(),
});

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const url = new URL(request.url);

	const data = actionSchema.parse({
		message: formData.get("message"),
		chatId: url.searchParams.get("chat"),
	});

	const sendMessageUseCase = container.get(SendMessageUseCase);
	const { chatId } = await sendMessageUseCase.execute(data);

	url.searchParams.set("chat", chatId);

	return redirect(url.toString());
}

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const chatId = url.searchParams.get("chat");

	const getChatMessagesUseCase = container.get(GetChatMessagesUseCase);
	return getChatMessagesUseCase.execute(chatId);
}

export default function () {
	return (
		<div className="p-6 flex gap-6">
			<ChatInterface />
			<GoalContent />
		</div>
	);
}
