import type { TicketCreateInput } from "infra-database/types";

import { Base } from "./Base";

export class Ticket extends Base {
  public async find(guildId: string, userId: string) {
    return await this.state.database.ticket.find(guildId, userId);
  }

  public async findByChannel(channelId: string) {
    return await this.state.database.ticket.findByChannel(channelId);
  }

  public async create(input: TicketCreateInput) {
    return await this.state.database.ticket.create(input);
  }

  public async setClaimedBy(channelId: string, current: string | null, claimedBy: string | null) {
    return await this.state.database.ticket.setClaimedBy(channelId, current, claimedBy);
  }

  public async delete(channelId: string) {
    return await this.state.database.ticket.delete(channelId);
  }
}
