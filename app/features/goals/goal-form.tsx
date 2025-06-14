import { useFetcher, useLoaderData } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { action, loader } from "~/routes/goals/edit";
import { toast } from "sonner";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function GoalForm() {
	const { goal } = useLoaderData<typeof loader>();
	const { Form: GoalForm, ...fetcher } = useFetcher<typeof action>();

	const arrayToString = (arr: string[]) => arr.join("\n");

	useEffect(() => {
		if (fetcher.state === "idle") return;

		if (fetcher.data?.success) {
			toast.success("Objetivo atualizado com sucesso");
			return;
		}

		if (fetcher.data?.error) {
			toast.error("Falha ao atualizar o objetivo", {
				description: fetcher.data?.error,
			});
			return;
		}
	}, [fetcher.data, fetcher.state]);

	return (
		<GoalForm method="PUT" className="space-y-6 p-6">
			<div className="space-y-2">
				<Label htmlFor="title">Título</Label>
				<Input id="title" name="title" defaultValue={goal.title} />
			</div>

			<div className="grid grid-cols-2 gap-6">
				<div className="space-y-2">
					<Label htmlFor="description">Descrição</Label>
					<Textarea
						className="h-36"
						id="description"
						name="description"
						defaultValue={goal.description}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="motivation_strategies">
						Estratégias de Motivação
					</Label>
					<Textarea
						className="h-36"
						id="motivation_strategies"
						name="motivation_strategies"
						defaultValue={goal.motivation_strategies}
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="estimated_time">Tempo Estimado</Label>
				<Input
					id="estimated_time"
					name="estimated_time"
					defaultValue={goal.estimated_time}
				/>
			</div>

			<div className="grid grid-cols-2 gap-6">
				<div className="space-y-2">
					<Label htmlFor="action_steps">Ações</Label>
					<Textarea
						className="h-36"
						id="action_steps"
						name="action_steps"
						rows={6}
						defaultValue={arrayToString(goal.action_steps)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="progress_indicators">Indicadores de Progresso</Label>
					<Textarea
						className="h-36"
						id="progress_indicators"
						name="progress_indicators"
						rows={5}
						defaultValue={arrayToString(goal.progress_indicators)}
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-6">
				<div className="space-y-2">
					<Label htmlFor="suggested_habits">Hábitos Sugeridos</Label>
					<Textarea
						className="h-36"
						id="suggested_habits"
						name="suggested_habits"
						rows={5}
						defaultValue={arrayToString(goal.suggested_habits)}
					/>
				</div>
			</div>

			<div className="flex justify-end">
				<input type="hidden" name="goal_id" value={goal.id} />
				<Button
					type="submit"
					disabled={fetcher.state !== "idle"}
					className="cursor-pointer"
				>
					{fetcher.state === "submitting" ? (
						<Loader2 className="animate-spin" />
					) : (
						"Salvar Objetivo"
					)}
				</Button>
			</div>
		</GoalForm>
	);
}
