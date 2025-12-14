import { useCopilotChat } from "@copilotkit/react-core";
import { useChatContext } from "@copilotkit/react-ui";
import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function CopilotHeader() {
	console.log("Rendering CopilotHeader", typeof window !== "undefined");

	const { setOpen, icons, labels } = useChatContext();
	const { reset } = useCopilotChat();

	const handleClearChat = () => {
		reset();
	};

	return (
		<div className="flex justify-between items-center p-2 bg-primary text-white">
			<div className="text-lg">{labels.title}</div>
			<div className="w-24 flex justify-end">
				<Button
					variant="ghost"
					size="sm"
					onClick={handleClearChat}
					className="cursor-pointer"
					title="Limpar conversa"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					onClick={() => setOpen(false)}
					aria-label="Fechar"
					variant="ghost"
					size="sm"
					className="cursor-pointer"
				>
					{icons.headerCloseIcon}
				</Button>
			</div>
		</div>
	);
}
