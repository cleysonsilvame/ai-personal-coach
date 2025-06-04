import { Link, useFetcher, useLoaderData } from "react-router";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { loader } from "~/routes/chats";

export function ChatsList() {
  const { chats } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const fetcherDelete = useFetcher();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [optimisticTitles, setOptimisticTitles] = useState<
    Record<string, string>
  >({});
  const [prevTitles, setPrevTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data &&
      fetcher.data.success === false &&
      fetcher.data.error
    ) {
      const { chatId } = fetcher.formData
        ? Object.fromEntries(fetcher.formData)
        : {};
      if (chatId && prevTitles[chatId]) {
        setOptimisticTitles((prev) => ({
          ...prev,
          [chatId]: prevTitles[chatId],
        }));
      }
    }
    if (fetcher.state === "idle") {
      setPrevTitles({});
    }
  }, [fetcher.state, fetcher.data]);

  function handleTitleClick(chat: { id: string; title: string | null }) {
    setEditingId(chat.id);
    setInputValue(optimisticTitles[chat.id] ?? chat.title ?? "");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleInputBlur(chatId: string) {
    if (editingId === chatId) {
      submitTitle(chatId);
    }
  }

  function handleInputKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    chatId: string
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      submitTitle(chatId);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  }

  function submitTitle(chatId: string) {
    if (inputValue.trim() !== "") {
      setPrevTitles((prev) => ({
        ...prev,
        [chatId]:
          optimisticTitles[chatId] ??
          chats.find((c) => c.id === chatId)?.title ??
          "",
      }));
      setOptimisticTitles((prev) => ({ ...prev, [chatId]: inputValue }));
      fetcher.submit(
        { chat_id: chatId, action: "updateChat", title: inputValue },
        { method: "POST", action: "/chats" }
      );
    }
    setEditingId(null);
  }

  return (
    <fetcherDelete.Form method="POST" className=" p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">ID</TableHead>
            <TableHead className="w-[300px]">Título</TableHead>
            <TableHead className="w-[100px]">Criado em</TableHead>
            <TableHead className="w-[1%] text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chats.map((chat) => (
            <TableRow key={chat.id}>
              <TableCell>
                <Link
                  to={`/task/new?chat=${chat.id}`}
                  className="decoration-dotted underline underline-offset-4"
                >
                  {chat.id}
                </Link>
              </TableCell>
              <TableCell className="font-medium">
                {editingId === chat.id ? (
                  <Input
                    autoFocus
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={() => handleInputBlur(chat.id)}
                    onKeyDown={(e) => handleInputKeyDown(e, chat.id)}
                    className="h-8"
                  />
                ) : (
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => handleTitleClick(chat)}
                  >
                    {optimisticTitles[chat.id] ?? chat.title ?? "Sem título"}
                  </span>
                )}
              </TableCell>
              <TableCell>{chat.created_at?.toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Edit chat"
                    onClick={() => handleTitleClick(chat)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    title="Delete chat"
                    name="action"
                    value="deleteChat"
                  >
                    <input type="hidden" name="chat_id" value={chat.id} />
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </fetcherDelete.Form>
  );
}
