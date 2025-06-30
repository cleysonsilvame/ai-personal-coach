import { redirect } from "react-router";
import { z } from "zod";
import { ChatInterface } from "~/features/chats/views/chat-interface";
import { GoalContent } from "~/features/chats/views/goal-content";
import { container } from "../../lib/container";
import type { Route } from "./+types/new";
import { SendMessageUseCase } from "~/features/chats/use-cases/send-message.server";
import { GetChatMessagesUseCase } from "~/features/chats/use-cases/get-chat-messages.server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";

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
		<>
			<div className="flex flex-col lg:hidden p-6 gap-6">
				<Tabs defaultValue="chat" className="w-full">
					<TabsList className="w-full">
						<TabsTrigger value="chat">Chat</TabsTrigger>
						<TabsTrigger value="goal">Objetivo</TabsTrigger>
					</TabsList>
					<TabsContent value="chat">
						<ChatInterface />
					</TabsContent>
					<TabsContent value="goal">
						<GoalContent />
					</TabsContent>
				</Tabs>
			</div>
			<div className="hidden lg:flex p-6 gap-6">
				<ChatInterface />
				<GoalContent />
			</div>
		</>
	);
}
