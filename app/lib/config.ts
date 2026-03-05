import { injectable } from "inversify";
import z from "zod";

export const flagsSchema = z.object({ // TODO: put this in another file?
	log_level: z.number().min(0).max(5),
});

export type Flags = z.infer<typeof flagsSchema>;

const envSchema = z.object({
	OPEN_ROUTER_API_KEY: z.string(),
	OPEN_ROUTER_BASE_URL: z.string(),
	OPEN_ROUTER_MODEL: z.string().default("deepseek/deepseek-chat-v3-0324:free"),
	OPEN_ROUTER_TEMPERATURE: z.number().default(0.7),

	GEMINI_API_KEY: z.string(),
	GEMINI_BASE_URL: z.string().default("https://api.gemini.google.com/v1"),
	GEMINI_EMBEDDING_MODEL: z.string().default("models/text-embedding-004"),

	UPSTASH_REDIS_HOST: z.string(),

	TURSO_DATABASE_URL: z.string(),
	TURSO_AUTH_TOKEN: z.string(),

	DRIZZLE_LOGGER: z
		.enum(["true", "false"])
		.default("false")
		.transform((val) => val === "true"),

	VERCEL_URL: z.string(),

	ERROR_NOTIFICATION_WEBHOOK_URL: z.string().url().optional(),

	EDGE_CONFIG: z.string().url().optional(),

	LOCAL_FEATURE_FLAGS: z
		.string()
		.optional()
		.transform((val) => (val ? JSON.parse(val) : undefined))
		.pipe(flagsSchema.partial().optional()),
});

export type Env = z.infer<typeof envSchema>;

@injectable("Singleton")
export class Config {
	readonly env: Env;

	constructor() {
		this.env = envSchema.parse(process.env);
	}
}
