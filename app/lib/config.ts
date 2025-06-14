import { injectable } from "inversify";
import z from "zod";

const envSchema = z.object({
	OPEN_ROUTER_API_KEY: z.string(),
	OPEN_ROUTER_BASE_URL: z.string(),
	OPEN_ROUTER_MODEL: z.string().default("google/gemma-3-27b-it:free"),
	OPEN_ROUTER_TEMPERATURE: z.number().default(0.7),
});

export type Env = z.infer<typeof envSchema>;

@injectable("Singleton")
export class Config {
	readonly env: Env;

	constructor() {
		this.env = envSchema.parse(process.env);
	}
}
