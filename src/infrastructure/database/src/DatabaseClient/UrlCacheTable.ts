import type { UrlCacheUpsertInput } from "../types";
import { Base } from "./Base";

export class UrlCacheTable extends Base {
  public async find(url: string) {
    return await this.prisma.urlCache.findUnique({ where: { url } });
  }

  public async findAll() {
    return await this.prisma.urlCache.findMany();
  }

  public async upsert(input: UrlCacheUpsertInput) {
    return await this.prisma.urlCache.upsert({
      where: { url: input.url },
      update: input,
      create: input,
    });
  }

  public async delete(url: string) {
    return await this.prisma.urlCache.delete({ where: { url } });
  }
}
