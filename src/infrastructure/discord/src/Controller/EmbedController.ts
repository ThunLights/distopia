import type { Embed } from "discord.js";

import { Base } from "./Base";

export class EmbedController extends Base {
  public async detectInviteLinks(embeds: Embed[]) {
    const inviteLinks = embeds
      .filter((embed) => embed.provider && embed.provider.name === "Discord")
      .map((embed) => embed.provider?.url)
      .filter((url) => url !== undefined);
    return inviteLinks;
  }
}
