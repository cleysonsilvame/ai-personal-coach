import { injectable } from "inversify";
import z from "zod";

const envSchema = z.object({
	OPEN_ROUTER_API_KEY: z.string(),
	OPEN_ROUTER_BASE_URL: z.string(),
	OPEN_ROUTER_MODEL: z.string().default("deepseek/deepseek-chat-v3-0324:free"),
	OPEN_ROUTER_TEMPERATURE: z.number().default(0.7),

	PRISMA_LOG_LEVEL: z
		.string()
		.optional()
		.transform((val) => val?.split(",") ?? [])
		.pipe(z.array(z.enum(["query", "info", "warn", "error"]))),
});

export type Env = z.infer<typeof envSchema>;

@injectable("Singleton")
export class Config {
	readonly env: Env;

	constructor() {
		this.env = envSchema.parse(process.env);
	}
}
