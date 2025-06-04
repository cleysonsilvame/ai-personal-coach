import { findSimilarTasks, getTask } from "~/services/task.server";

import type { Route } from "./+types/task-view";
import { TaskView } from "~/features/tasks/task-view";
import { redirect } from "react-router";

export async function loader({ params }: Route.LoaderArgs) {
  const task = await getTask(params.id as string);

  if (!task) {
    return redirect("/tasks");
  }

  const similarTasks = await findSimilarTasks(task.title, 4);

  return { task, similarTasks };
}

export default function ({ loaderData }: Route.ComponentProps) {
  const { task, similarTasks } = loaderData;

  return <TaskView task={task} similarTasks={similarTasks} />;
}
