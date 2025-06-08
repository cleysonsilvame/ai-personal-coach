import { deleteTask, getGoals } from "~/services/task.server";

import { GoalsList } from "~/features/tasks/tasks-list";
import type { Route } from "./+types/list";

export async function action({ request }: Route.ActionArgs) {
	await deleteTask(await request.formData());
}

export async function loader() {
	return { goals: await getGoals() };
}

export default function () {
	return <GoalsList />;
}
