import { deleteChat, updateChat } from "~/services/chat.server";

import { ChatsList } from "~/features/tasks/chats-list";
import type { Route } from "./+types/chats";
import prisma from "prisma/prisma";

export async function loader() {
  return { chats: await prisma.chat.findMany() };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  switch (formData.get("action")) {
    case "deleteChat":
      return deleteChat(formData);
    case "updateChat":
      return updateChat(formData);
  }
}

export default function () {
  return <ChatsList />;
}
