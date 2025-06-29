import { inject, injectable } from "inversify";
import type { Transaction } from "~/features/core/services/transaction";
import { UnitOfWork } from "~/features/core/services/unit-of-work";
import { PrismaClient } from "~/lib/prisma-client";

@injectable()
export class PrismaUnitOfWork extends UnitOfWork {
	constructor(
		@inject(PrismaClient)
		private readonly prisma: PrismaClient,
	) {
		super();
	}

	execute<T>(
		fn: (tx: Transaction) => Promise<T>,
		options?: { timeout: number; maxWait?: number },
	): Promise<T> {
		return this.prisma.client.$transaction((tx) => fn(tx), options);
	}
}
