import { Link, useFetcher, useLoaderData } from "react-router";
import { MessageCircle, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { Button } from "~/components/ui/button";
import type { loader } from "~/routes/tasks";

export function TasksList() {
  const { tasks } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="POST" className=" p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Título</TableHead>
            <TableHead className="w-[100px]">Estimativa</TableHead>
            <TableHead className="w-[1%] text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">
                <Link
                  to={`/task/view/${task.id}`}
                  className="decoration-dotted underline underline-offset-4"
                >
                  {task.title}
                </Link>
              </TableCell>
              <TableCell>{task.estimated_time}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Chat"
                    disabled={!task.chat_message}
                  >
                    <Link to={`/task/new?chat=${task.chat_message?.chat_id}`}>
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Edit task"
                  >
                    <Link to={`/task/edit/${task.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    title="Delete task"
                  >
                    <input type="hidden" name="task_id" value={task.id} />
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </fetcher.Form>
  );
}
