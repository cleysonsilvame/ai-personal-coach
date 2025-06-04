import { useFetcher, useLoaderData } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { loader } from "~/routes/task-edit";
import { toast } from "sonner";
import { useEffect } from "react";

export function TaskForm() {
  const { task } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  // Helper function to convert array to string
  const arrayToString = (arr: string[]) => arr.join("\n");

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data?.success) {
        toast.success("Task atualizada com sucesso");
      } else {
        toast.error("Falha ao atualizar a task");
      }
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <fetcher.Form method="POST" className="space-y-6 p-6">
      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" defaultValue={task.title} />
      </div>
      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          className="h-36"
          id="description"
          name="description"
          defaultValue={task.description}
        />
      </div>

      {/* Tempo Estimado */}
      <div className="space-y-2">
        <Label htmlFor="estimatedTime">Tempo Estimado</Label>
        <Input
          id="estimatedTime"
          name="estimated_time"
          defaultValue={task.estimated_time}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Etapas */}
        <div className="space-y-2">
          <Label htmlFor="steps">Etapas</Label>
          <Textarea
            className="h-36"
            id="steps"
            name="steps"
            rows={6}
            defaultValue={arrayToString(JSON.parse(task.steps ?? ""))}
          />
        </div>

        {/* Testes Sugeridos */}
        <div className="space-y-2">
          <Label htmlFor="suggestedTests">Testes Sugeridos</Label>
          <Textarea
            className="h-36"
            id="suggestedTests"
            name="suggested_tests"
            rows={5}
            defaultValue={arrayToString(JSON.parse(task.suggested_tests ?? ""))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Critérios de Aceitação */}
        <div className="space-y-2">
          <Label htmlFor="acceptanceCriteria">Critérios de Aceitação</Label>
          <Textarea
            className="h-36"
            id="acceptanceCriteria"
            name="acceptance_criteria"
            rows={5}
            defaultValue={arrayToString(
              JSON.parse(task.acceptance_criteria ?? "")
            )}
          />
        </div>

        {/* Sugestão de Implementação */}
        <div className="space-y-2">
          <Label htmlFor="implementationSuggestion">
            Sugestão de Implementação
          </Label>
          <Textarea
            className="h-36"
            id="implementationSuggestion"
            name="implementation_suggestion"
            defaultValue={task.implementation_suggestion ?? ""}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <input type="hidden" name="task_id" value={task.id} />
        <Button type="submit" disabled={fetcher.state !== "idle"}>
          Salvar Tarefa
        </Button>
      </div>
    </fetcher.Form>
  );
}
