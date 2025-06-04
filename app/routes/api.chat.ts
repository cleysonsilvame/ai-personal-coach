import { createChatMessages, getChatCompletions } from "~/services/chat.server";

import { ChatMessageRole } from "~/generated/prisma";
import type { Route } from "./+types/api.chat";
import prisma from "prisma/prisma";
import { redirect } from "react-router";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const userInput = formData.get("message") as string;
  const chatId = formData.get("chatId") as string;

  const userMessage = {
    content: userInput,
    role: ChatMessageRole.user,
  };

  let chat;

  if (chatId) {
    chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        messages: true,
      },
    });

    if (chat) {
      const assistantMessage = {
        content:
          (await getChatCompletions([...chat.messages, userMessage])) ?? "",
        role: ChatMessageRole.assistant,
      };

      await createChatMessages(chat.id, userMessage, assistantMessage);
    }
  } else {
    const assistantMessage = {
      content: (await getChatCompletions([userMessage])) ?? "",
      role: ChatMessageRole.assistant,
    };

    chat = await prisma.chat.create({
      data: {},
    });

    await createChatMessages(chat.id, userMessage, assistantMessage);

    return redirect(`/task/new?chat=${chat.id}`);
  }
}
