import type { Guild } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class GuildUpdateHandler extends BaseHandler<(oldGuild: Guild, newGuild: Guild) => void> {
  public override async handle(oldGuild: Guild, newGuild: Guild): Promise<void> {
    const guild = await this.core.guild.find(newGuild.id);

    if (guild) {
      await this.core.guild.save({
        ...guild,
        name: oldGuild.name !== newGuild.name ? newGuild.name : guild.name,
        icon: oldGuild.icon !== newGuild.icon ? newGuild.icon : guild.icon,
        banner: oldGuild.banner !== newGuild.banner ? newGuild.banner : guild.banner,
      });
    }
  }
}
