import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { ArrowRight } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import type { GoalsMapper } from "./mappers/goals";

interface Props {
	goal: ReturnType<typeof GoalsMapper.toHtml>;
	similarGoals: unknown[] | null;
}

export function GoalView({ goal, similarGoals }: Props) {
	return (
		<ScrollArea className="max-h-[calc(100vh-4rem)] p-4">
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/goals">Objetivos</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{goal.title}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<section className="grid grid-cols-2 gap-6">
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
								<TabsTrigger value="acceptance">
									Critérios de Aceite
								</TabsTrigger>
								<TabsTrigger value="tests">Testes Sugeridos</TabsTrigger>
							</TabsList>
							<TabsContent value="steps">
								<ul className="list-decimal list-inside space-y-2 mt-2">
									{goal.action_steps.length > 0 ? (
										goal.action_steps.map((step, i) => (
											<li key={i} className="text-base text-foreground">
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
										goal.progress_indicators.map((criteria, i) => (
											<li key={i} className="text-base text-foreground">
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
										goal.suggested_habits.map((test, i) => (
											<li
												key={i}
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
				<Card className="bg-muted/40">
					<CardHeader>
						<CardTitle className="text-lg">Tarefas Similares</CardTitle>
						<CardDescription>
							Outras tarefas que podem ser relevantes para você
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col p-0">
						{similarGoals && similarGoals.length > 0 ? (
							similarGoals.map((t, i) => {
								const similarityPercent = Math.round(
									(t.similarity_score ?? 0) * 100,
								);
								return (
									<>
										<a
											key={t.id}
											href={`/goal/view/${t.id}`}
											className="flex items-center gap-4 px-6 py-4 group hover:bg-muted/60 transition rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
											title={`Ver objetivo: ${t.title}`}
										>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<div className="font-semibold text-base text-foreground truncate">
														{t.title}
													</div>
													<span className="text-xs text-muted-foreground">
														{similarityPercent}%
													</span>
												</div>
												<div className="text-sm text-muted-foreground truncate">
													{t.description}
												</div>
											</div>
											<Badge
												variant="secondary"
												className="flex items-center gap-1 px-2 py-1 ml-2"
											>
												<span>{t.estimated_time}</span>
												<ArrowRight className="w-4 h-4 text-primary ml-1" />
											</Badge>
										</a>
										{i < similarGoals.length - 1 && (
											<Separator className="mx-6" />
										)}
									</>
								);
							})
						) : (
							<div className="text-muted-foreground text-sm p-6">
								Nenhum objetivo similar encontrado.
							</div>
						)}
					</CardContent>
				</Card>
			</section>
		</ScrollArea>
	);
}
