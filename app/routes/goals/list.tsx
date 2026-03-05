import { z } from "zod";
import { GoalsList } from "~/features/goals/goals-list";
import { GoalsMapper } from "~/features/goals/mappers/goals";
import { DeleteGoalUseCase } from "~/features/goals/use-cases/delete-goal.server";
import { GetGoalsUseCase } from "~/features/goals/use-cases/get-goals.server";
import { container } from "~/lib/container";
import type { Route } from "./+types/list";

const deleteSchema = z.object({
	goal_id: z.string().uuid(),
});

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	switch (request.method) {
		case "DELETE": {
			const { success, data } = deleteSchema.safeParse(
				Object.fromEntries(formData.entries()),
			);

			if (!success) {
				return { success: false, error: "Dados inválidos" };
			}

			const deleteGoalUseCase = container.get(DeleteGoalUseCase);
			await deleteGoalUseCase.execute(data.goal_id);

			return { success: true };
		}
	}
}

export async function loader() {
	const getGoalsUseCase = container.get(GetGoalsUseCase);
	const goals = await getGoalsUseCase.execute();

	return { goals: goals.map(GoalsMapper.toHtml) };
}

export default function () {
	return <GoalsList />;
}
