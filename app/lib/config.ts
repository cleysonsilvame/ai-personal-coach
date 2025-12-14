import { injectable } from "inversify";
import z from "zod";

const envSchema = z.object({
	OPEN_ROUTER_API_KEY: z.string(),
	OPEN_ROUTER_BASE_URL: z.string(),
	OPEN_ROUTER_MODEL: z.string().default("deepseek/deepseek-chat-v3-0324:free"),
	OPEN_ROUTER_CHAT_MODEL: z.string().optional(),
	OPEN_ROUTER_COPILOT_MODEL: z.string().optional(),
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
});

export type Env = z.infer<typeof envSchema>;

@injectable("Singleton")
export class Config {
	readonly env: Env;

	constructor() {
		this.env = envSchema.parse(process.env);
	}

	getChatModel(): string {
		return this.env.OPEN_ROUTER_CHAT_MODEL || this.env.OPEN_ROUTER_MODEL;
	}

	getCopilotModel(): string {
		return this.env.OPEN_ROUTER_COPILOT_MODEL || this.env.OPEN_ROUTER_MODEL;
	}
}
