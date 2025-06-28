import { redirect } from "react-router";
import { GoalView } from "~/features/goals/goal-view";
import { GetGoalByIdUseCase } from "~/features/goals/use-cases/get-goal-by-id.server";
import { container } from "~/lib/container";
import type { Route } from "./+types/view";
import { GoalsMapper } from "~/features/goals/mappers/goals";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { SimilarGoals } from "~/features/goals/similar-goals";

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
			<section className="flex gap-6">
				<GoalView goal={goal} />
				{similarGoals && <SimilarGoals similarGoals={similarGoals} />}
			</section>
		</ScrollArea>
	);
}
