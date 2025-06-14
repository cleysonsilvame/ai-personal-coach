import { prisma } from "~/lib/prisma-client";
import { GoalRepository } from "../features/goals/repositories/goal";
import type {
	ChatMessageGetPayload,
	GoalCreateInput,
} from "generated/prisma/models";

export class PrismaGoalRepository extends GoalRepository {
	async createGoal(data: GoalCreateInput): Promise<{ id: string }> {
		const goal = await prisma.goal.create({
			data,
			select: { id: true },
		});

		return goal;
	}

	async findGoalByMessageId(messageId: string) {
		const message = await prisma.chatMessage.findUnique({
			where: { id: messageId },
			include: { goal: true },
		});

		return message;
	}
}
