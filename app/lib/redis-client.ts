import { inject, injectable } from "inversify";
import { Redis } from "ioredis";
import type { Config } from "./config";

@injectable("Singleton")
export class RedisClient extends Redis {
	constructor(@inject("Config") config: Config) {
		super(config.env.UPSTASH_REDIS_HOST);
	}
}
