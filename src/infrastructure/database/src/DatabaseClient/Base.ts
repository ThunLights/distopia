import type { PrismaPg } from "@prisma/adapter-pg";

import type { PrismaClient } from "../prisma-client";
import type { DefaultArgs } from "../prisma-client/runtime/client";

export abstract class Base {
  constructor(protected readonly prisma: PrismaClient<{ adapter: PrismaPg }, never, DefaultArgs>) {}
}
