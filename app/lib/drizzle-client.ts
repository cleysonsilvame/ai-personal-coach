import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { inject, injectable } from "inversify";
import { Config } from "./config";

@injectable("Singleton")
export class DrizzleClient {
	client: ReturnType<typeof drizzle>;

	constructor(@inject(Config) private readonly config: Config) {
		const turso = createClient({
			url: this.config.env.TURSO_DATABASE_URL,
			authToken: this.config.env.TURSO_AUTH_TOKEN,
		});
		this.client = drizzle(turso, {
			logger: true,
		});
	}
}
