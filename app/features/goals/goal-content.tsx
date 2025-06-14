import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	CheckSquare,
	ClipboardList,
	Lightbulb,
	Timer,
	Target,
	Heart,
} from "lucide-react";
import { Link, useFetcher, useLoaderData } from "react-router";

import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { loader } from "~/routes/goals/new";

export function GoalContent() {
	const fetcher = useFetcher();
	const { goal_content, message_id, goal_id } = useLoaderData<typeof loader>();

	if (!goal_content) {
		return null;
	}

	return (
		<section className="min-w-[300px]">
			<ScrollArea className="h-[calc(100vh-150px)] pb-4">
				<div className="space-y-6">
					<Card>
						<CardHeader className="flex flex-row items-center gap-2">
							<Target className="h-5 w-5" />
							<CardTitle>Título</CardTitle>
						</CardHeader>
						<CardContent>{goal_content.title}</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center gap-2">
							<ClipboardList className="h-5 w-5" />
							<CardTitle>Descrição</CardTitle>
						</CardHeader>
						<CardContent>{goal_content.description}</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center gap-2">
							<Timer className="h-5 w-5" />
							<CardTitle>Tempo Estimado</CardTitle>
						</CardHeader>
						<CardContent>{goal_content.estimated_time}</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center gap-2">
							<ClipboardList className="h-5 w-5" />
							<CardTitle>Passos de Ação</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="list-disc pl-6 space-y-2">
								{goal_content.action_steps?.map((step: string) => (
									<li key={step}>{step}</li>
								))}
							</ul>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center gap-2">
							<CheckSquare className="h-5 w-5" />
							<CardTitle>Indicadores de Progresso</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="list-disc pl-6 space-y-2">
								{goal_content.progress_indicators?.map((indicator: string) => (
									<li key={indicator}>{indicator}</li>
								))}
							</ul>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center gap-2">
							<Heart className="h-5 w-5" />
							<CardTitle>Hábitos Sugeridos</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="list-disc pl-6 space-y-2">
								{goal_content.suggested_habits?.map((habit: string) => (
									<li key={habit}>{habit}</li>
								))}
							</ul>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center gap-2">
							<Lightbulb className="h-5 w-5" />
							<CardTitle>Estratégias de Motivação</CardTitle>
						</CardHeader>
						<CardContent>{goal_content.motivation_strategies}</CardContent>
					</Card>
				</div>
			</ScrollArea>
			<fetcher.Form
				method="POST"
				action="/api/goals/new"
				className="flex justify-between"
			>
				<input type="hidden" name="message_id" value={message_id} />
				<input type="hidden" name="goal_id" value={goal_id} />
				{goal_id ? (
					<Button type="button">
						<Link to={`/goal/view/${goal_id}`}>Detalhes do Objetivo</Link>
					</Button>
				) : (
					<div>&nbsp;</div>
				)}
				<Button type="submit" disabled={fetcher.state !== "idle"}>
					Salvar Objetivo
				</Button>
			</fetcher.Form>
		</section>
	);
}
