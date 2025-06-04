import Redis from "ioredis";

export const TTL = 60 * 60 * 24;

export const cache = new Redis(process.env.UPSTASH!);
