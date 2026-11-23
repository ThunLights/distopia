import type { DefaultArgs } from "@prisma/client/runtime/client";

import type { Prisma, PrismaClient } from "../prisma-client/client";
import type { GlobalOmitConfig } from "../prisma-client/internal/prismaNamespace";

export abstract class Base {
  constructor(
    protected readonly prisma: PrismaClient<never, GlobalOmitConfig | undefined, DefaultArgs>,
  ) {}

  protected async executeAll(statements: Prisma.Sql[]): Promise<void> {
    if (statements.length) {
      await this.prisma.$transaction(statements.map((sql) => this.prisma.$executeRaw(sql)));
    }
  }
}
