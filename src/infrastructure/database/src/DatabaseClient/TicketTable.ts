import type { Ticket, TicketCreateInput } from "../types/Ticket";
import { Base } from "./Base";

export class TicketTable extends Base {
  public async find(guildId: string, userId: string): Promise<Ticket | null> {
    return await this.prisma.ticket.findUnique({ where: { guildId_userId: { guildId, userId } } });
  }

  public async findByChannel(channelId: string): Promise<Ticket | null> {
    return await this.prisma.ticket.findUnique({ where: { channelId } });
  }

  // Returns false when the user already has an open ticket (unique guildId + userId).
  public async create(input: TicketCreateInput): Promise<boolean> {
    const { count } = await this.prisma.ticket.createMany({
      data: [input],
      skipDuplicates: true,
    });
    return count > 0;
  }

  // Returns false when claimedBy changed since `current` was read.
  public async setClaimedBy(
    channelId: string,
    current: string | null,
    claimedBy: string | null,
  ): Promise<boolean> {
    const { count } = await this.prisma.ticket.updateMany({
      where: { channelId, claimedBy: current },
      data: { claimedBy },
    });
    return count > 0;
  }

  public async delete(channelId: string): Promise<void> {
    await this.prisma.ticket.deleteMany({ where: { channelId } });
  }
}
