import { redirect } from "react-router";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { GoalView } from "~/features/goals/goal-view";
import { GoalsMapper } from "~/features/goals/mappers/goals";
import { SimilarGoals } from "~/features/goals/similar-goals";
import { GetGoalByIdUseCase } from "~/features/goals/use-cases/get-goal-by-id.server";
import { container } from "~/lib/container";
import type { Route } from "./+types/view";

export async function loader({ params }: Route.LoaderArgs) {
	const getGoalByIdUseCase = container.get(GetGoalByIdUseCase);
	const { goal, similarGoals } = await getGoalByIdUseCase.execute(
		params.id,
		true,
	);

	return { goal: GoalsMapper.toHtml(goal), similarGoals };
}

export default function ({ loaderData }: Route.ComponentProps) {
	const { goal, similarGoals } = loaderData;

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
			<div className="block md:hidden">
				<Tabs defaultValue="goal" className="w-full">
					<TabsList className="w-full">
						<TabsTrigger value="goal">Detalhes</TabsTrigger>
						<TabsTrigger value="similar" disabled={!similarGoals}>
							Similares
						</TabsTrigger>
					</TabsList>
					<TabsContent value="goal">
						<GoalView goal={goal} />
					</TabsContent>
					<TabsContent value="similar">
						{similarGoals && <SimilarGoals similarGoals={similarGoals} />}
					</TabsContent>
				</Tabs>
			</div>
			<section className="hidden md:flex gap-6">
				<GoalView goal={goal} />
				{similarGoals && <SimilarGoals similarGoals={similarGoals} />}
			</section>
		</ScrollArea>
	);
}
