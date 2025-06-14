import { z } from "zod";
import { SaveGoalFromMessageUseCase } from "~/features/goals/use-cases/save-goal-from-message.server";
import { container } from "~/lib/container";
import type { Route } from "./+types/new-goal-by-message";

const saveGoalSchema = z.object({
	message_id: z.string(),
	goal_id: z.string().optional(),
});

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const { message_id, goal_id } = saveGoalSchema.parse(
		Object.fromEntries(formData),
	);

	const saveGoalFromMessageUseCase = container.get(SaveGoalFromMessageUseCase);

	await saveGoalFromMessageUseCase.execute({
		messageId: message_id,
		goalId: goal_id,
	});
}
