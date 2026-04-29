import type { Guild } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class GuildUpdateHandler extends BaseHandler<(oldGuild: Guild, newGuild: Guild) => void> {
  public override async handle(oldGuild: Guild, newGuild: Guild): Promise<void> {
    const guild = await this.core.guild.find(newGuild.id);

    if (guild) {
      const isChanged = {
        name: oldGuild.name !== newGuild.name,
        icon: oldGuild.icon !== newGuild.icon,
        banner: oldGuild.banner !== newGuild.banner,
      };
      if (isChanged.name || isChanged.icon || isChanged.banner) {
        await this.core.guild.save({
          ...guild,
          name: isChanged.name ? newGuild.name : guild.name,
          icon: isChanged.icon ? newGuild.icon : guild.icon,
          banner: isChanged.banner ? newGuild.banner : guild.banner,
        });
      }
    }
  }
}
