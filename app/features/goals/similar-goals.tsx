import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

import { ArrowRight } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import type { SimilarGoal } from "./entities/similar-goal";

interface Props {
	similarGoals: SimilarGoal[];
}

export function SimilarGoals({ similarGoals }: Props) {
	return (
		<Card className="bg-muted/40 flex-1/3">
			<CardHeader>
				<CardTitle className="text-lg">Tarefas Similares</CardTitle>
				<CardDescription>
					Outras tarefas que podem ser relevantes para você
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col p-0">
				{similarGoals && similarGoals.length > 0 ? (
					similarGoals.map((t, i) => {
						const similarityPercent = Math.round((t.similarity ?? 0) * 100);
						return (
							<>
								<a
									key={t.id}
									href={`/goals/view/${t.id}`}
									className="flex items-center gap-4 px-6 py-4 group hover:bg-muted/60 transition rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
									title={`Ver objetivo: ${t.title}`}
								>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<div className="font-semibold text-base text-foreground truncate">
												{t.title}
											</div>
											<span className="text-xs text-muted-foreground">
												{similarityPercent}%
											</span>
										</div>
										<div className="text-sm text-muted-foreground truncate">
											{t.description}
										</div>
									</div>
									<Badge
										variant="secondary"
										className="flex items-center gap-1 px-2 py-1 ml-2"
									>
										{/* <span>{t.estimated_time}</span> */}{" "}
										{/* TODO: add estimated time */}
										<ArrowRight className="w-4 h-4 text-primary ml-1" />
									</Badge>
								</a>
								{i < similarGoals.length - 1 && <Separator className="mx-6" />}
							</>
						);
					})
				) : (
					<div className="text-muted-foreground text-sm p-6">
						Nenhum objetivo similar encontrado.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
