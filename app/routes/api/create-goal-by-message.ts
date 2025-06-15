import { z } from "zod";
import { CreateGoalFromMessageUseCase } from "~/features/goals/use-cases/create-goal-from-message.server";
import { container } from "~/lib/container";
import type { Route } from "./+types/create-goal-by-message";

const createGoalSchema = z.object({
	message_id: z.string(),
});

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const { message_id } = createGoalSchema.parse(Object.fromEntries(formData));

	const createGoalFromMessageUseCase = container.get(CreateGoalFromMessageUseCase);

	await createGoalFromMessageUseCase.execute({
		messageId: message_id,
	});
}
