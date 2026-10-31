import type { Ticket as TicketModel, TicketCreateInput } from "infra-database/types";

import type { AppState } from "./AppState";
import { Base } from "./Base";
import type { Guild } from "./Guild";

export type TicketActor = { userId: string; isAdministrator: boolean; roleIds: string[] };

export class Ticket extends Base {
  constructor(
    state: AppState,
    private readonly guild: Pick<Guild, "getSetting">,
  ) {
    super(state);
  }

  public async isStaff(guildId: string, actor: TicketActor): Promise<boolean> {
    if (actor.isAdministrator) {
      return true;
    }

    const settings = await this.guild.getSetting(guildId);
    return !!settings?.ticketRole && actor.roleIds.includes(settings.ticketRole);
  }

  // Added members can see the channel too, so visibility alone is not enough.
  public async canClose(ticket: TicketModel, actor: TicketActor): Promise<boolean> {
    return actor.userId === ticket.userId || (await this.isStaff(ticket.guildId, actor));
  }

  // Admins can release someone else's claim, e.g. when that staff member has left.
  public canChangeClaim({ claimedBy }: TicketModel, actor: TicketActor): boolean {
    return !claimedBy || claimedBy === actor.userId || actor.isAdministrator;
  }

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
