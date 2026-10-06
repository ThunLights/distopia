import { createRedisClient } from "infra-redis";

const { REDIS_URL } = process.env;
if (!REDIS_URL) {
  throw new Error("REDIS_URL is required");
}

export const redis = createRedisClient(REDIS_URL);
