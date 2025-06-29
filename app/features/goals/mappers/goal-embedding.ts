import { z } from "zod";
import { SimilarGoal } from "../entities/similar-goal";

const similarGoalSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	estimated_time: z.string(),
	similarity: z.number(),
});

export const GoalEmbeddingMapper = {
	toDomain(raw: unknown): SimilarGoal {
		const validatedData = similarGoalSchema.parse(raw);
		return new SimilarGoal(validatedData);
	},
};
