import { REDIS_URL } from "$app/env/private";
import { createRedisClient } from "infra-redis";

export const redis = createRedisClient(REDIS_URL!);
