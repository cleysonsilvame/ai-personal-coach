import { getTask, updateTask } from "~/services/task.server";

import type { Route } from "./+types/task-edit";
import { TaskForm } from "~/features/tasks/tasks-form";
import { redirect } from "react-router";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const task_id = formData.get("task_id") as string;
  formData.delete("task_id");

  try {
    await updateTask(task_id, formData);

    return { success: true };
  } catch (error) {
    console.log(error);

    return { success: false };
  }
}

export async function loader({ params }: Route.LoaderArgs) {
  const task = await getTask(params.id as string);

  if (!task) {
    return redirect("/tasks");
  }

  return { task };
}

export default function () {
  return <TaskForm />;
}
