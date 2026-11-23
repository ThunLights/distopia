import { createMemory } from "app-core/remote";

import { redis } from "./redis";

export const memory = createMemory(redis);
