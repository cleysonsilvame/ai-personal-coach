import { MessageCircle, Pencil, Trash2 } from "lucide-react";
import { Link, useFetcher, useLoaderData } from "react-router";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";

import { Button } from "~/components/ui/button";
import type { loader } from "~/routes/goals/list";
import { useEffect, useState } from "react";

export function GoalsList() {
	const { goals: initialGoals } = useLoaderData<typeof loader>();
	const [goals, setGoals] = useState(initialGoals);
	const { Form: DeleteGoalForm } = useFetcher();

	const handleDelete = async (event: React.FormEvent<HTMLFormElement>) => {
		const formData = new FormData(event.target as HTMLFormElement);
		const goalId = formData.get("goal_id");

		setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
	};

	useEffect(() => {
		setGoals(initialGoals);
	}, [initialGoals]);

	return (
		<div className="p-6">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[300px]">Título</TableHead>
						<TableHead className="w-[100px]">Estimativa</TableHead>
						<TableHead className="w-[1%] text-center">Ações</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{goals.map((goal) => (
						<TableRow key={goal.id}>
							<TableCell className="font-medium">
								<Link
									to={`/goals/view/${goal.id}`}
									className="decoration-dotted underline underline-offset-4"
								>
									{goal.title}
								</Link>
							</TableCell>
							<TableCell>{goal.estimated_time}</TableCell>
							<TableCell>
								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										title="Chat do objetivo"
										disabled={!goal.chat_id}
									>
										<Link to={`/chats/new?chat=${goal.chat_id}`}>
											<MessageCircle className="h-4 w-4" />
										</Link>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										title="Editar objetivo"
										asChild
									>
										<Link to={`/goals/edit/${goal.id}`}>
											<Pencil className="h-4 w-4" />
										</Link>
									</Button>
									<DeleteGoalForm method="DELETE" onSubmit={handleDelete}>
										<Button
											type="submit"
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-destructive hover:text-destructive cursor-pointer"
											title="Deletar objetivo"
										>
											<input type="hidden" name="goal_id" value={goal.id} />
											<Trash2 className="h-4 w-4" />
										</Button>
									</DeleteGoalForm>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
