import type { TablesRelationalConfig } from "drizzle-orm";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { unmanaged } from "inversify";
import { container } from "~/lib/container";
import { DrizzleClient } from "~/lib/drizzle-client";

export abstract class BaseDrizzleRepository {
	protected readonly drizzle: DrizzleClient;
	// | {
	// 		client: SQLiteTransaction<
	// 			"async",
	// 			unknown,
	// 			Record<string, unknown>,
	// 			TablesRelationalConfig
	// 		>;
	//   };

	constructor(
		@unmanaged() tx?: SQLiteTransaction<
			"async",
			unknown,
			Record<string, unknown>,
			TablesRelationalConfig
		>,
	) {
		if (tx) {
			this.drizzle = { client: tx };
		} else {
			this.drizzle = container.get(DrizzleClient);
		}
	}
}
