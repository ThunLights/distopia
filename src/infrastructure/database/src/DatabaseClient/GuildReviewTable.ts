import type {
  GuildReview,
  GuildReviewUpdateInput,
  GuildReviewUpsertInput,
} from "../types/GuildReview";
import { Base } from "./Base";

export class GuildReviewTable extends Base {
  public async find(guildId: string, userId: string): Promise<GuildReview | null> {
    return await this.prisma.guildReview.findUnique({
      where: { userId_guildId: { guildId, userId } },
    });
  }

  public async findAll(guildId: string): Promise<GuildReview[]> {
    return await this.prisma.guildReview.findMany({
      where: { guildId },
    });
  }

  public async update(input: GuildReviewUpdateInput): Promise<GuildReview> {
    return await this.prisma.guildReview.update({
      where: { userId_guildId: { userId: input.userId, guildId: input.guildId } },
      data: input,
    });
  }

  public async upsert(input: GuildReviewUpsertInput): Promise<GuildReview> {
    return await this.prisma.guildReview.upsert({
      where: { userId_guildId: { userId: input.userId, guildId: input.guildId } },
      update: input,
      create: input,
    });
  }

  public async delete(guildId: string, userId: string): Promise<GuildReview> {
    return await this.prisma.guildReview.delete({ where: { userId_guildId: { userId, guildId } } });
  }
}
