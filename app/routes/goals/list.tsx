import { GoalsList } from "~/features/tasks/tasks-list";
import type { Route } from "./+types/list";
import { container } from "~/lib/container";
import { GoalsMapper } from "~/features/goals/mappers/goals";
import { GetGoalsUseCase } from "~/features/goals/use-cases/get-goals.server";

export async function action({ request }: Route.ActionArgs) {
	// await deleteTask(await request.formData());
}

export async function loader() {
	const getGoalsUseCase = container.get(GetGoalsUseCase);
	const goals = await getGoalsUseCase.execute();

	return { goals: goals.map(GoalsMapper.toHtml) };
}

export default function () {
	return <GoalsList />;
}
