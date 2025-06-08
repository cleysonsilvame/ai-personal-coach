import { createChatMessages, getChatCompletions } from "~/services/chat.server";

import { prisma } from "~/lib/prisma-client";
import { redirect } from "react-router";
import { ChatMessageRole } from "generated/prisma";
import type { Route } from "./+types/new-goal-by-message";

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	console.log("Form Data:", formData);
	// const message_id = formData.get("message_id") as string;
	// const task_id = formData.get("task_id") as string;

	// const message = await prisma.chatMessage.findUnique({
	// 	where: {
	// 		id: message_id,
	// 	},
	// });

	// if (!message) {
	// 	return { error: "Mensagem não encontrada" };
	// }

	// const content = JSON.parse(message.content);

	// const taskData = {
	// 	title: content.title,
	// 	description: content.description,
	// 	steps: JSON.stringify(content.steps),
	// 	acceptance_criteria: JSON.stringify(content.acceptance_criteria),
	// 	suggested_tests: JSON.stringify(content.suggested_tests),
	// 	estimated_time: content.estimated_time,
	// 	implementation_suggestion: content.implementation_suggestion,
	// 	chat_message_id: message_id,
	// };

	// if (task_id) {
	// 	await prisma.task.update({
	// 		where: {
	// 			id: task_id,
	// 		},
	// 		data: taskData,
	// 	});

	// 	await storeTaskAsEmbeddings(task_id, taskData);
	// } else {
	// 	const task = await prisma.task.create({
	// 		data: taskData,
	// 	});

	// 	await storeTaskAsEmbeddings(task.id, taskData);
	// }
}
