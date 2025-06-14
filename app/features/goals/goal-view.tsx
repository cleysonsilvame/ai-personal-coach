import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import type { GoalsMapper } from "./mappers/goals";

interface Props {
	goal: ReturnType<typeof GoalsMapper.toHtml>;
}

export function GoalView({ goal }: Props) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-4">
				<div>
					<CardTitle className="text-2xl mb-1">{goal.title}</CardTitle>
					<CardDescription>ID: {goal.id}</CardDescription>
				</div>
				<Badge variant="secondary">{goal.estimated_time}</Badge>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				<div>
					<Label className="mb-1">Descrição</Label>
					<p className="text-base text-muted-foreground whitespace-pre-line bg-muted/40 rounded-md p-3 border mt-1">
						{goal.description}
					</p>
				</div>
				{goal.suggested_habits && (
					<div>
						<Label className="mb-1">Sugestão de Implementação</Label>
						<p className="text-sm text-muted-foreground whitespace-pre-line bg-muted/30 rounded-md p-3 border mt-1">
							{JSON.stringify(goal.suggested_habits)}
						</p>
					</div>
				)}
				<Separator />
				<Tabs defaultValue="steps" className="w-full">
					<TabsList>
						<TabsTrigger value="steps">Passos</TabsTrigger>
						<TabsTrigger value="acceptance">Critérios de Aceite</TabsTrigger>
						<TabsTrigger value="tests">Testes Sugeridos</TabsTrigger>
					</TabsList>
					<TabsContent value="steps">
						<ul className="list-decimal list-inside space-y-2 mt-2">
							{goal.action_steps.length > 0 ? (
								goal.action_steps.map((step) => (
									<li key={step} className="text-base text-foreground">
										{step}
									</li>
								))
							) : (
								<li className="text-muted-foreground">
									Nenhum passo cadastrado.
								</li>
							)}
						</ul>
					</TabsContent>
					<TabsContent value="acceptance">
						<ul className="list-disc list-inside space-y-2 mt-2">
							{goal.progress_indicators.length > 0 ? (
								goal.progress_indicators.map((criteria) => (
									<li key={criteria} className="text-base text-foreground">
										{criteria}
									</li>
								))
							) : (
								<li className="text-muted-foreground">
									Nenhum critério cadastrado.
								</li>
							)}
						</ul>
					</TabsContent>
					<TabsContent value="tests">
						<ul className="list-disc list-inside space-y-2 mt-2">
							{goal.suggested_habits.length > 0 ? (
								goal.suggested_habits.map((test) => (
									<li
										key={test}
										className="text-base font-mono text-foreground"
									>
										{test}
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
