import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { Pencil, Trash2 } from "lucide-react";
import { Link, useFetcher, useNavigate } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import type { Goal } from "./entities/goal";
import type { GoalsMapper } from "./mappers/goals";

interface Props {
	goal: ReturnType<typeof GoalsMapper.toHtml<Goal>>;
}

export function GoalView({ goal }: Props) {
	const { Form: DeleteGoalForm, ...fetcher } = useFetcher();
	const navigate = useNavigate();

	function onDeleteGoal() {
		navigate("/goals");
	}

	return (
		<Card className="flex-1/2">
			<CardHeader className="flex flex-row items-center justify-between gap-4">
				<div>
					<CardTitle className="text-2xl mb-1">{goal.title}</CardTitle>
					<CardDescription>ID: {goal.id}</CardDescription>
				</div>
				<div className="flex gap-2 items-center">
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
					<DeleteGoalForm
						action="/goals"
						method="DELETE"
						onSubmit={onDeleteGoal}
					>
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
				<Badge variant="secondary">{goal.estimated_time}</Badge>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				<div>
					<Label className="mb-2">Descrição</Label>
					<p className="text-base text-muted-foreground whitespace-pre-line bg-muted/40 rounded-md p-3 border mt-1">
						{goal.description}
					</p>
				</div>
				<div>
					<Label className="mb-2">Estratégias de Motivação</Label>
					<p className="text-base text-muted-foreground whitespace-pre-line bg-muted/40 rounded-md p-3 border mt-1">
						{goal.motivation_strategies}
					</p>
				</div>

				<Separator />
				<Tabs defaultValue="action_steps" className="w-full">
					<TabsList>
						<TabsTrigger value="action_steps" className="cursor-pointer">
							Passos de Ação
						</TabsTrigger>
						<TabsTrigger value="progress_indicators" className="cursor-pointer">
							Indicadores de Progresso
						</TabsTrigger>
						<TabsTrigger value="suggested_habits" className="cursor-pointer">
							Hábitos Sugeridos
						</TabsTrigger>
					</TabsList>
					<TabsContent value="action_steps" className="ml-2">
						<ul className="list-decimal list-inside space-y-2 mt-2">
							{goal.action_steps.length > 0 ? (
								goal.action_steps.map((action_step) => (
									<li key={action_step} className="text-base text-foreground">
										{action_step}
									</li>
								))
							) : (
								<li className="text-muted-foreground">
									Nenhum passo cadastrado.
								</li>
							)}
						</ul>
					</TabsContent>
					<TabsContent value="progress_indicators" className="ml-2">
						<ul className="list-disc list-inside space-y-2 mt-2">
							{goal.progress_indicators.length > 0 ? (
								goal.progress_indicators.map((progress_indicator) => (
									<li
										key={progress_indicator}
										className="text-base text-foreground"
									>
										{progress_indicator}
									</li>
								))
							) : (
								<li className="text-muted-foreground">
									Nenhum indicador cadastrado.
								</li>
							)}
						</ul>
					</TabsContent>
					<TabsContent value="suggested_habits" className="ml-2">
						<ul className="list-disc list-inside space-y-2 mt-2">
							{goal.suggested_habits.length > 0 ? (
								goal.suggested_habits.map((suggested_habit) => (
									<li
										key={suggested_habit}
										className="text-base text-foreground"
									>
										{suggested_habit}
									</li>
								))
							) : (
								<li className="text-muted-foreground">
									Nenhum teste sugerido.
								</li>
							)}
						</ul>
					</TabsContent>
				</Tabs>
			</CardContent>
			<CardFooter className="justify-end text-xs text-muted-foreground">
				Criado em: {goal.created_at}
				{goal.updated_at && (
					<span className="ml-4">Atualizado em: {goal.updated_at}</span>
				)}
			</CardFooter>
		</Card>
	);
}
