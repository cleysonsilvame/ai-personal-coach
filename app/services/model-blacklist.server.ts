import { inject, injectable } from "inversify";
import { RedisClient } from "~/lib/redis-client";

const BLACKLIST_DURATION_MS = 1000 * 60 * 10; // 10 minutes
const PREFIX = "model_blacklist:";

@injectable("Singleton")
export class RedisModelBlacklistService {
  constructor(@inject(RedisClient) private readonly redis: RedisClient) { }

  private getKey(model: string) {
    return `${PREFIX}${model}`;
  }

  async isBlacklisted(model: string): Promise<boolean> {
    const exists = await this.redis.exists(this.getKey(model));
    return exists === 1;
  }

  async addToBlacklist(model: string, ttl?: number): Promise<void> {
    const ttlMs = ttl ?? BLACKLIST_DURATION_MS;
    const ttlSeconds = Math.floor(ttlMs / 1000);
    await this.redis.set(this.getKey(model), "1", "EX", ttlSeconds);
  }

  async removeFromBlacklist(model: string): Promise<void> {
    await this.redis.del(this.getKey(model));
  }

  async clearBlacklist(): Promise<void> {
    const keys = await this.redis.keys(`${PREFIX}*`);
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }

  async getAllBlacklisted(): Promise<string[]> {
    const keys = await this.redis.keys(`${PREFIX}*`);
    return keys.map((key) => key.replace(PREFIX, ""));
  }
}
