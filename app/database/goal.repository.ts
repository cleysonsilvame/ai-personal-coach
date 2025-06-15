import type { GoalCreateInput, GoalUpdateInput } from "generated/prisma/models";
import { prisma } from "~/lib/prisma-client";
import { GoalRepository } from "../features/goals/repositories/goal";

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

	async findById(id: string) {
		const goal = await prisma.goal.findUnique({
			where: { id },
		});

		return goal;
	}

	async findAll() {
		const goals = await prisma.goal.findMany({
			include: { chat_message: true },
		});

		return goals;
	}

	async deleteById(id: string): Promise<void> {
		await prisma.goal.delete({
			where: { id },
		});
	}

	async updateById(
		id: string,
		data: Omit<GoalUpdateInput, "id">,
		options?: {
			removeMessageLink?: boolean;
		},
	) {
		await prisma.goal.update({
			where: { id },
			data: {
				...data,
				chat_message: options?.removeMessageLink
					? {
							disconnect: true,
						}
					: undefined,
			},
		});
	}
}
