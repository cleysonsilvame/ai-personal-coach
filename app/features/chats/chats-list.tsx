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
import type { action, loader } from "~/routes/chats/list";
import { toast } from "sonner";

export function ChatsList() {
	const { chats: initialChats } = useLoaderData<typeof loader>();
	const [chats, setChats] = useState(initialChats);
	const [currentChatEditing, setCurrentChatEditing] = useState<{
		title: string;
		id: string;
	} | null>(null);
	const { Form: UpdateChatForm, data: updateChatData } =
		useFetcher<typeof action>();
	const { Form: DeleteChatForm, data: deleteChatData } =
		useFetcher<typeof action>();

	function handleTitleClick(chat: { id: string; title: string | null }) {
		setCurrentChatEditing({ id: chat.id, title: chat.title ?? "" });
	}

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		setCurrentChatEditing((prev) => prev && { ...prev, title: e.target.value });
	}

	function handleInputBlur() {
		if (currentChatEditing) {
			setChats((prev) =>
				prev.map((chat) =>
					chat.id === currentChatEditing.id
						? { ...chat, title: currentChatEditing.title }
						: chat,
				),
			);
			setCurrentChatEditing(null);
		}
	}

	function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Escape") {
			e.preventDefault();
			setCurrentChatEditing(null);
			return;
		}
	}

	function handleDeleteChat(e: React.FormEvent<HTMLFormElement>) {
		const formData = new FormData(e.target as HTMLFormElement);
		const chatId = formData.get("chat_id") as string;
		if (!chatId) return;
		setChats((prev) => prev.filter((chat) => chat.id !== chatId));
	}

	useEffect(() => {
		if (deleteChatData?.error) {
			toast.error(deleteChatData.error);
		}
	}, [deleteChatData]);

	useEffect(() => {
		if (updateChatData?.error) {
			toast.error(updateChatData.error);
		}
	}, [updateChatData]);

	useEffect(() => {
		setChats(initialChats);
	}, [initialChats]);

	return (
		<div className=" p-6">
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
									to={{
										pathname: "/goals/new",
										search: `?chat=${chat.id}`,
									}}
									className="decoration-dotted underline underline-offset-4"
								>
									{chat.id}
								</Link>
							</TableCell>
							<TableCell className="font-medium">
								<UpdateChatForm method="PATCH" onSubmit={handleInputBlur}>
									<input type="hidden" name="chat_id" value={chat.id} />
									{currentChatEditing?.id === chat.id ? (
										<Input
											autoFocus
											value={currentChatEditing.title}
											onChange={handleInputChange}
											onBlur={handleInputBlur}
											onKeyDown={handleInputKeyDown}
											className="h-8"
											name="title"
										/>
									) : (
										<>
											<input
												type="hidden"
												name="title"
												value={chat.title ?? ""}
											/>
											<button
												type="button"
												className="cursor-pointer text-left hover:underline"
												onClick={() => handleTitleClick(chat)}
											>
												{chat.title ?? "Sem título"}
											</button>
										</>
									)}
								</UpdateChatForm>
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
									<DeleteChatForm method="DELETE" onSubmit={handleDeleteChat}>
										<Button
											type="submit"
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-destructive hover:text-destructive cursor-pointer"
											title="Delete chat"
										>
											<input type="hidden" name="chat_id" value={chat.id} />
											<Trash2 className="h-4 w-4" />
										</Button>
									</DeleteChatForm>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
