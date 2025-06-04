import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  CheckSquare,
  ClipboardList,
  Lightbulb,
  TestTube2,
  Timer,
} from "lucide-react";
import { Link, useFetcher, useLoaderData } from "react-router";

import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { loader } from "~/routes/task-new";

export function TaskContent() {
  const fetcher = useFetcher();
  const { task, message_id, task_id } = useLoaderData<typeof loader>();

  if (!task.title) {
    return null;
  }

  return (
    <section>
      <ScrollArea className="h-[calc(100vh-150px)] pb-4">
        <div className="space-y-6">
          {/* Title Card */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Timer className="h-5 w-5" />
              <CardTitle>Nome</CardTitle>
            </CardHeader>
            <CardContent>{task.title}</CardContent>
          </Card>
          {/* Estimated Time Card */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Timer className="h-5 w-5" />
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>{task.description}</CardContent>
          </Card>
          {/* Estimated Time Card */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Timer className="h-5 w-5" />
              <CardTitle>Tempo Estimado</CardTitle>
            </CardHeader>
            <CardContent>{task.estimated_time}</CardContent>
          </Card>

          {/* Steps Card */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              <CardTitle>Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {task.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Suggested Tests Card */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <TestTube2 className="h-5 w-5" />
              <CardTitle>Testes Sugeridos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {task.suggested_tests.map((test) => (
                  <li key={test}>{test}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Acceptance Criteria Card */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              <CardTitle>Critérios de Aceitação</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {task.acceptance_criteria.map((criteria) => (
                  <li key={criteria}>{criteria}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Implementation Suggestion Card */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              <CardTitle>Sugestão de Implementação</CardTitle>
            </CardHeader>
            <CardContent>{task.implementation_suggestion}</CardContent>
          </Card>
        </div>
      </ScrollArea>
      <fetcher.Form method="POST" className="flex justify-between">
        <input type="hidden" name="message_id" value={message_id} />
        <input type="hidden" name="task_id" value={task_id} />
        {task_id ? (
          <Button type="button">
            <Link to={`/task/view/${task_id}`}>Detalhes da Tarefa</Link>
          </Button>
        ) : (
          <div>&nbsp;</div>
        )}
        <Button type="submit" disabled={fetcher.state !== "idle"}>
          Salvar Task
        </Button>
      </fetcher.Form>
    </section>
  );
}
