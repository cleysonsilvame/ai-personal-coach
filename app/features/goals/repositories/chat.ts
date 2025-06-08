import type { SelectSubset } from "~/generated/prisma/internal/prismaNamespace";
import type {
	ChatDefaultArgs,
	ChatGetPayload,
} from "~/generated/prisma/models";

export abstract class ChatRepository {
	abstract findById<T extends ChatDefaultArgs>(
		id: string,
		options?: SelectSubset<T, ChatDefaultArgs>,
	): Promise<ChatGetPayload<T & { where: { id: string } }> | null>;

	abstract create<T extends ChatDefaultArgs>(
		options?: SelectSubset<T, ChatDefaultArgs>,
	): Promise<ChatGetPayload<T & { data: object }>>;

	abstract update(id: string, title: string): Promise<void>;
}
