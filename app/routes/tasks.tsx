import { deleteTask, getTasks } from "~/services/task.server";

import type { Route } from "./+types/tasks";
import { TasksList } from "~/features/tasks/tasks-list";

export async function action({ request }: Route.ActionArgs) {
  await deleteTask(await request.formData());
}

export async function loader() {
  return { tasks: await getTasks() };
}

export default function () {
  return <TasksList />;
}
