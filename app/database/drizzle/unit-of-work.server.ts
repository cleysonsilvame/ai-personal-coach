import { chatsTable } from "drizzle/schema";
import { inject, injectable } from "inversify";
import type { Transaction } from "~/features/core/services/transaction";
import { UnitOfWork } from "~/features/core/services/unit-of-work";
import { DrizzleClient } from "~/lib/drizzle-client";

@injectable()
export class DrizzleUnitOfWork extends UnitOfWork {
	constructor(
		@inject(DrizzleClient)
		private readonly drizzle: DrizzleClient,
	) {
		super();
	}

	execute<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
		return this.drizzle.client.transaction(fn);
	}
}
