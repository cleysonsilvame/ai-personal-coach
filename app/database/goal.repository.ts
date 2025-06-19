import type { GoalUpdateInput } from "generated/prisma/models";
import { inject } from "inversify";
import type { Goal } from "~/features/goals/entities/goal";
import { GoalsMapper } from "~/features/goals/mappers/goals";
import { PrismaClient } from "~/lib/prisma-client";
import { GoalRepository } from "../features/goals/repositories/goal";

export class PrismaGoalRepository extends GoalRepository {
	constructor(@inject(PrismaClient) private readonly prisma: PrismaClient) {
		super();
	}

	async createGoal(goal: Goal): Promise<Goal> {
		const goalData = await this.prisma.client.goal.create({
			data: goal,
		});
		return GoalsMapper.toDomain(goalData);
	}

	async findGoalByMessageId(messageId: string) {
		const message = await this.prisma.client.chatMessage.findUnique({
			where: { id: messageId },
			include: { goal: true },
		});

		return message;
	}

	async findById(id: string) {
		const goal = await this.prisma.client.goal.findUnique({
			where: { id },
		});

		return goal;
	}

	async findAll() {
		const goals = await this.prisma.client.goal.findMany({
			include: { chat_message: true },
		});

		return goals;
	}

	async deleteById(id: string): Promise<void> {
		await this.prisma.client.goal.delete({
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
		await this.prisma.client.goal.update({
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
