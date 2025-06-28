import { redirect } from "react-router";
import { GoalForm } from "~/features/goals/goal-form";
import type { Route } from "./+types/edit";
import { container } from "~/lib/container";
import { GetGoalByIdUseCase } from "~/features/goals/use-cases/get-goal-by-id.server";
import { GoalsMapper } from "~/features/goals/mappers/goals";
import z from "zod";
import { UpdateGoalUseCase } from "~/features/goals/use-cases/update-goal.server";

const updateGoalSchema = z.object({
	goal_id: z.string().uuid(),
	title: z.string().min(1),
	description: z.string().min(1),
	estimated_time: z.string().min(1),
	action_steps: z
		.string()
		.min(1)
		.transform((val) => val.split("\n")),
	progress_indicators: z
		.string()
		.min(1)
		.transform((val) => val.split("\n")),
	suggested_habits: z
		.string()
		.min(1)
		.transform((val) => val.split("\n")),
	motivation_strategies: z.string().min(1),
});

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();

	const { success, data, error } = updateGoalSchema.safeParse(
		Object.fromEntries(formData),
	);

	if (!success) {
		return {
			success: false,
			error: JSON.stringify(error.flatten().fieldErrors, null, 2),
		};
	}

	const updateGoalUseCase = container.get(UpdateGoalUseCase);
	await updateGoalUseCase.execute(data.goal_id, data);

	return { success: true };
}

export async function loader({ params }: Route.LoaderArgs) {
	const getGoalByIdUseCase = container.get(GetGoalByIdUseCase);
	const { goal } = await getGoalByIdUseCase.execute(params.id);

	return { goal: GoalsMapper.toHtml(goal) };
}

export default function () {
	return <GoalForm />;
}
