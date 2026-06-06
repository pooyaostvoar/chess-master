import { createClient, type RedisClientType } from "redis";
import { readSecret } from "../utils/secret";

let redisClient: RedisClientType | null = null;

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    redisClient = createClient({
      url:
        readSecret("/run/secrets/redis_url") ||
        process.env.REDIS_URL ||
        "redis://:redis-pass@localhost:6378",
    });
    redisClient.connect().catch(console.error);
  }
  return redisClient;
}
