import type { TablesRelationalConfig } from "drizzle-orm";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { unmanaged } from "inversify";
import { container } from "~/lib/container";
import { DrizzleClient } from "~/lib/drizzle-client";

export type DrizzleTransaction = Parameters<
	Parameters<typeof DrizzleClient.prototype.client.transaction>[0]
>[0] extends SQLiteTransaction<
	infer TResultType,
	infer TRunResult,
	infer TFullSchema,
	infer TSchema
>
	? SQLiteTransaction<TResultType, TRunResult, TFullSchema, TSchema>
	: never;

export abstract class BaseDrizzleRepository {
	protected readonly drizzle: DrizzleClient | { client: DrizzleTransaction };

	constructor(@unmanaged() tx?: DrizzleTransaction) {
		if (tx) {
			this.drizzle = { client: tx };
		} else {
			this.drizzle = container.get(DrizzleClient);
		}
	}
}
