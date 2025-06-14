import { redirect } from "react-router";
import { GoalView } from "~/features/goals/goal-view";
import { GetGoalByIdUseCase } from "~/features/goals/use-cases/get-goal-by-id.server";
import { container } from "~/lib/container";
import type { Route } from "./+types/view";
import { GoalsMapper } from "~/features/goals/mappers/goals";

export async function loader({ params }: Route.LoaderArgs) {
	const getGoalByIdUseCase = container.get(GetGoalByIdUseCase);
	const goal = await getGoalByIdUseCase.execute(params.id);

	if (!goal) {
		return redirect("/goals");
	}

	return { goal: GoalsMapper.toHtml(goal), similarGoals: null };
}

export default function ({ loaderData }: Route.ComponentProps) {
	const { goal, similarGoals } = loaderData;

	return <GoalView goal={goal} similarGoals={similarGoals} />;
}
