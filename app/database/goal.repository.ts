import { inject } from "inversify";
import type { Goal } from "~/features/goals/entities/goal";
import { GoalsMapper } from "~/features/goals/mappers/goals";
import { PrismaClient } from "~/lib/prisma-client";
import {
	GoalRepository,
	type FindAllInclude,
	type UpdateGoalInput,
} from "../features/goals/repositories/goal";
import { GoalAggregate } from "~/features/goals/aggregates/goal-aggregate";
import { ChatMessagesMapper } from "~/features/chats/mappers/chat-messages";
import type { ChatMessage } from "~/features/chats/entities/chat-message";

type PrismaFindManyInclude =
	| {
			include: { chat_message: true };
	  }
	| {
			include: undefined;
	  };

export class PrismaGoalRepository extends GoalRepository {
	constructor(@inject(PrismaClient) private readonly prisma: PrismaClient) {
		super();
	}

	async createGoal(goal: Goal): Promise<Goal> {
		const goalData = await this.prisma.client.goal.create({
			data: GoalsMapper.toPrisma(goal),
		});
		return GoalsMapper.toDomain(goalData);
	}

	async findById(id: string) {
		const goal = await this.prisma.client.goal.findUnique({
			where: { id },
		});

		if (!goal) {
			return null;
		}

		return GoalsMapper.toDomain(goal);
	}

	async findAll<T extends FindAllInclude>(
		include?: T,
	): Promise<GoalAggregate<ChatMessage | null>[]> {
		const prismaInclude: PrismaFindManyInclude["include"] = include?.chatMessage
			? { chat_message: true }
			: undefined;

		const goals = await this.prisma.client.goal.findMany<PrismaFindManyInclude>(
			{ include: prismaInclude },
		);

		return goals.map((goal) => {
			if ("chat_message" in goal) {
				const chatMessage = goal.chat_message
					? ChatMessagesMapper.toDomain(goal.chat_message)
					: null;

				return new GoalAggregate(GoalsMapper.toDomain(goal), chatMessage);
			}

			return new GoalAggregate(GoalsMapper.toDomain(goal));
		});
	}

	async deleteById(id: string): Promise<void> {
		await this.prisma.client.goal.delete({
			where: { id },
		});
	}

	async updateById(id: string, data: UpdateGoalInput) {
		await this.prisma.client.goal.update({
			where: { id },
			data: GoalsMapper.toUpdatePrisma(data),
		});
	}
}
