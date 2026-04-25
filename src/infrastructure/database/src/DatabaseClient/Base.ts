import type { PrismaPg } from "@prisma/adapter-pg";

import type { DefaultArgs } from "../prisma";
import type { PrismaClient } from "../prisma-client";

export abstract class Base {
  constructor(protected readonly prisma: PrismaClient<{ adapter: PrismaPg }, never, DefaultArgs>) {}
}
