import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";

import { Send } from "lucide-react";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { loader } from "~/routes/chats/new";

export function ChatInterface() {
	const { messages } = useLoaderData<typeof loader>();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [message, setMessage] = useState("");
	const localMessage = useRef("");

	const fetcher = useFetcher();
	const isLoading = fetcher.state !== "idle";

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isLoading]);

	useEffect(() => {
		if (isLoading) {
			localMessage.current = message;
			setMessage("");
		}
	}, [isLoading]);

	return (
		<Card className="flex flex-col h-[calc(100vh-110px)] w-full border shadow-sm pb-0 pt-0">
			<ScrollArea className="flex-1 p-4 h-96">
				<div className="space-y-4">
					{messages.map((message) => (
						<div
							key={message.id}
							data-role={message.role}
							className="flex data-[role='user']:justify-end data-[role='assistant']:justify-start"
						>
							<div
								data-role={message.role}
								className="flex gap-3 max-w-[80%] data-[role='user']:flex-row-reverse data-[role='assistant']:flex-row"
							>
								<Avatar className="h-8 w-8">
									<div
										data-role={message.role}
										className="flex h-full w-full items-center justify-center rounded-full data-[role='user']:bg-primary data-[role='user']:text-primary-foreground data-[role='assistant']:bg-muted data-[role='assistant']:text-muted-foreground"
									>
										{message.role === "user" ? "U" : "A"}
									</div>
								</Avatar>
								<div
									data-role={message.role}
									className="rounded-lg p-3 data-[role='user']:bg-primary data-[role='user']:text-primary-foreground data-[role='assistant']:bg-muted"
								>
									<div
										className="text-sm"
										// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized with ssr
										dangerouslySetInnerHTML={{
											__html: message.content.message,
										}}
									/>
									<p className="text-xs opacity-70 mt-1">
										{new Date(message.createdAt).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</p>
								</div>
							</div>
						</div>
					))}
					{isLoading && (
						<>
							<div className="flex justify-end opacity-80">
								<div className="flex gap-3 max-w-[80%] flex-row-reverse">
									<Avatar className="h-8 w-8">
										<div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
											U
										</div>
									</Avatar>
									<div className="rounded-lg p-3 bg-primary text-primary-foreground">
										<p className="text-sm">{localMessage.current}</p>
										<p className="text-xs opacity-70 mt-1">
											{new Date().toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
								</div>
							</div>

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
						</>
					)}
					<div ref={messagesEndRef} />
				</div>
			</ScrollArea>

			<div className="p-4 border-t mt-auto">
				<fetcher.Form className="flex gap-2" method="POST">
					<Input
						name="message"
						placeholder="Descreva a tarefa..."
						className="flex-1"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						autoComplete="off"
					/>
					<Button type="submit" disabled={isLoading || !message} size="icon">
						<Send className="h-4 w-4" />
					</Button>
				</fetcher.Form>
			</div>
		</Card>
	);
}
