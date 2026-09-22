import { env } from "$env/dynamic/private";
import { createRedisClient } from "infra-redis";

export const redis = createRedisClient(env.REDIS_URL!);
