import type { DefaultArgs } from "@prisma/client/runtime/client";

import type { PrismaClient } from "../prisma-client/client";
import type { GlobalOmitConfig } from "../prisma-client/internal/prismaNamespace";

export abstract class Base {
  constructor(
    protected readonly prisma: PrismaClient<never, GlobalOmitConfig | undefined, DefaultArgs>,
  ) {}
}
