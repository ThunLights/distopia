import type { Guild } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class GuildUpdateHandler extends BaseHandler<(oldGuild: Guild, newGuild: Guild) => void> {
  public override async handle(_oldGuild: Guild, newGuild: Guild): Promise<void> {
    const guild = await this.core.guild.find(newGuild.id);

    if (guild) {
      await this.core.guild.save({
        ...guild,
        name: newGuild.name,
        icon: newGuild.icon,
        banner: newGuild.banner,
      });
    }
  }
}
