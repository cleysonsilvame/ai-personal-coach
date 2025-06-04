import { ChatMessageRole, type ChatMessage } from "~/generated/prisma";
import type { Route } from "./+types/task-new";
import { TasksChatbot } from "~/features/tasks/tasks-chatbot";
import prisma from "prisma/prisma";
import { redirect, useSearchParams } from "react-router";
import { storeTaskAsEmbeddings } from "~/services/task.server";

type Task = {
  title: string;
  description: string;
  steps: string[];
  acceptance_criteria: string[];
  suggested_tests: string[];
  estimated_time: string;
  implementation_suggestion: string;
};

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const message_id = formData.get("message_id") as string;
  const task_id = formData.get("task_id") as string;

  const message = await prisma.chatMessage.findUnique({
    where: {
      id: message_id,
    },
  });

  if (!message) {
    return { error: "Mensagem não encontrada" };
  }

  const content = JSON.parse(message.content);

  const taskData = {
    title: content.title,
    description: content.description,
    steps: JSON.stringify(content.steps),
    acceptance_criteria: JSON.stringify(content.acceptance_criteria),
    suggested_tests: JSON.stringify(content.suggested_tests),
    estimated_time: content.estimated_time,
    implementation_suggestion: content.implementation_suggestion,
    chat_message_id: message_id,
  };

  if (task_id) {
    await prisma.task.update({
      where: {
        id: task_id,
      },
      data: taskData,
    });

    await storeTaskAsEmbeddings(task_id, taskData);
  } else {
    const task = await prisma.task.create({
      data: taskData,
    });

    await storeTaskAsEmbeddings(task.id, taskData);
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const chatId = url.searchParams.get("chat");

  let messages = [] as ChatMessage[];
  let taskJson;
  let message_id;
  let task_id;

  if (chatId) {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        messages: {
          include: {
            task: true,
          },
        },
      },
    });

    if (!chat) {
      return redirect("/task/new");
    }

    messages = chat.messages.map((message) => ({
      ...message,
      content:
        message.role === ChatMessageRole.assistant
          ? message.content === "{}"
            ? "🤷‍♂️ Sua pergunta gerou uma resposta inválida"
            : "✅ Solicitação atendida. Verifique o painel ao lado 👉"
          : message.content,
    }));
    ``;

    const message = chat.messages[messages.length - 1];
    taskJson = message.content;
    message_id = message.id;
    task_id = message.task?.id;
  }

  return {
    messages,
    message_id,
    task_id,
    task: JSON.parse(taskJson ?? "{}") as Task,
  };
}

export default function () {
  return <TasksChatbot />;
}
