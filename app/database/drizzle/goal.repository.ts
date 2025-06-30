import type { ChatMessage } from "~/features/chats/entities/chat-message";
import { ChatMessagesMapper } from "~/features/chats/mappers/chat-messages";
import { GoalAggregate } from "~/features/goals/aggregates/goal-aggregate";
import type { Goal } from "~/features/goals/entities/goal";
import { GoalsMapper } from "~/features/goals/mappers/goals";
import type {
	FindAllInclude,
	GoalRepository,
	UpdateGoalInput,
} from "../../features/goals/repositories/goal";
import {
	BaseDrizzleRepository,
	type DrizzleTransaction,
} from "./base.repository";
import { chatMessagesTable, goalsTable } from "drizzle/schema";
import { eq, sql } from "drizzle-orm";

export class DrizzleGoalRepository
	extends BaseDrizzleRepository
	implements GoalRepository
{
	setTransaction(tx: DrizzleTransaction): GoalRepository {
		return new DrizzleGoalRepository(tx);
	}

	async createGoal(goal: Goal): Promise<Goal> {
		const [goalData] = await this.drizzle.client
			.insert(goalsTable)
			.values(GoalsMapper.toPersistence(goal)) //TODO: check connection with chat_message_id
			.returning();
		return GoalsMapper.toDomain(goalData);
	}

	async findById(id: string) {
		const goal = await this.drizzle.client
			.select()
			.from(goalsTable)
			.where(eq(goalsTable.id, id));

		if (!goal[0]) {
			return null;
		}

		return GoalsMapper.toDomain(goal[0]);
	}

	async findAll<T extends FindAllInclude>(
		include?: T,
	): Promise<GoalAggregate<ChatMessage | null>[]> {
		let query = null;

		query = this.drizzle.client
			.select({
				goals: goalsTable,
				chat_messages: include?.chatMessage
					? chatMessagesTable
					: sql<null>`NULL`, // TODO: check if this is correct
			})
			.from(goalsTable);

		if (include?.chatMessage) {
			query = query.leftJoin(
				chatMessagesTable,
				eq(chatMessagesTable.id, goalsTable.chat_message_id),
			);
		}
		const results = await query;

		return results.map((row) => {
			const chatMessage = row.chat_messages
				? ChatMessagesMapper.toDomain(row.chat_messages)
				: null;

			return new GoalAggregate(GoalsMapper.toDomain(row.goals), chatMessage);
		});
	}

	async deleteById(id: string): Promise<void> {
		await this.drizzle.client.delete(goalsTable).where(eq(goalsTable.id, id));
	}

	async updateById(id: string, data: UpdateGoalInput) {
		const [goal] = await this.drizzle.client
			.update(goalsTable)
			.set(GoalsMapper.toUpdatePersistence(data))
			.where(eq(goalsTable.id, id))
			.returning();
		return GoalsMapper.toDomain(goal);
	}
}
