import prisma from "prisma/prisma";
import { ChatRepository } from "~/features/goals/repositories/chat";
import type { SelectSubset } from "~/generated/prisma/internal/prismaNamespace";
import type {
	ChatCreateArgs,
	ChatDefaultArgs,
	ChatFindUniqueArgs,
} from "~/generated/prisma/models";

export class PrismaChatRepository extends ChatRepository {
	async findById<T extends ChatDefaultArgs>(
		id: string,
		options?: SelectSubset<T, ChatDefaultArgs>,
	) {
		const args = { where: { id } } satisfies ChatFindUniqueArgs;

		const chat = await prisma.chat.findUnique<T & typeof args>(
			Object.assign(args, options),
		);

		return chat;
	}

	async create<T extends ChatDefaultArgs>(
		options?: SelectSubset<T, ChatDefaultArgs>,
	) {
		const args = { data: {} } satisfies ChatCreateArgs;

		const chat = await prisma.chat.create<T & typeof args>(
			Object.assign(args, options),
		);

		return chat;
	}

	async update(id: string, title: string): Promise<void> {
		await prisma.chat.update({
			where: { id },
			data: { title },
		});
	}
}
