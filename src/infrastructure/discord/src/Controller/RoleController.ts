import { Base } from "./Base";

export class RoleController extends Base {
  public async fetchGuild(guildId: string, roleId: string) {
    return this.client.guilds.cache.get(guildId)?.roles.cache.get(roleId)?.members;
  }

  public async give(guildId: string, userId: string, roleId: string) {
    return await this.client.guilds.cache
      .get(guildId)
      ?.members.cache.get(userId)
      ?.roles.add(roleId);
  }

  public async deprive(guildId: string, userId: string, roleId: string) {
    return await this.client.guilds.cache
      .get(guildId)
      ?.members.cache.get(userId)
      ?.roles.remove(roleId);
  }
}
