import type { Prisma } from "generated/prisma";
import { inject, injectable } from "inversify";
import { PrismaClient } from "~/lib/prisma-client";

@injectable()
export class UnitOfWork {
	constructor(
		@inject(PrismaClient)
		private readonly prisma: PrismaClient,
	) {}

	public execute<T>(
		fn: (tx: Prisma.TransactionClient) => Promise<T>,
		options?: { timeout: number; maxWait?: number },
	): Promise<T> {
		return this.prisma.client.$transaction(fn, options);
	}
}
