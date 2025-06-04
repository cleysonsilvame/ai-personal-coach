import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData, useSearchParams } from "react-router";

import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import type { ChatMessage } from "~/generated/prisma";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Send } from "lucide-react";
import type { loader } from "~/routes/task-new";

export function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher();
  const isLoading = fetcher.state !== "idle";
  const [params] = useSearchParams();
  const { messages } = useLoaderData<typeof loader>();
  const chatId = params.get("chat");

  // Estado local para mensagens e input
  const [localMessages, setLocalMessages] =
    useState<({ pending?: boolean } & ChatMessage)[]>(messages);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const value = inputValue.trim();

    if (!value) return;

    const now = Date.now();
    const date = new Date();

    const optimisticMessage: ChatMessage & { pending: boolean } = {
      chat_id: `optimistic-${now}`,
      id: `optimistic-${now}`,
      content: value,
      role: "user",
      created_at: date,
      updated_at: date,
      pending: true,
    };

    setLocalMessages((prev) => [...prev, optimisticMessage]);
    setInputValue("");

    inputRef.current?.focus();

    fetcher.submit(
      { chatId: chatId ?? "", message: value },
      { method: "POST", action: "/api/chat" }
    );
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-110px)] w-full border shadow-sm pb-0 pt-0">
      <ScrollArea className="flex-1 p-4 h-96">
        <div className="space-y-4">
          {localMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="h-8 w-8">
                  <div
                    className={`flex h-full w-full items-center justify-center rounded-full ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.role === "user" ? "U" : "A"}
                  </div>
                </Avatar>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.created_at?.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground">
                    A
                  </div>
                </Avatar>
                <div className="rounded-lg p-3 bg-muted">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t mt-auto">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            name="message"
            placeholder="Descreva a tarefa..."
            className="flex-1"
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoComplete="off"
          />
          <Button type="submit" disabled={isLoading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
