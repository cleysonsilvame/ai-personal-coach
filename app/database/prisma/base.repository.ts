import type { Prisma } from "generated/prisma";
import { unmanaged } from "inversify";
import { container } from "~/lib/container";
import { PrismaClient } from "~/lib/prisma-client";

export abstract class BasePrismaRepository {
	protected readonly prisma:
		| PrismaClient
		| { client: Prisma.TransactionClient };

	constructor(@unmanaged() tx?: Prisma.TransactionClient) {
		if (tx) {
			this.prisma = { client: tx };
		} else {
			this.prisma = container.get(PrismaClient);
		}
	}
}
