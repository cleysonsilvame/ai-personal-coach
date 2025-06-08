import { findSimilarTasks, getGoal } from "~/services/task.server";

import { redirect } from "react-router";
import { TaskView } from "~/features/tasks/task-view";
import type { Route } from "./+types/task-view";

export async function loader({ params }: Route.LoaderArgs) {
  const task = await getGoal(params.id as string);

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
