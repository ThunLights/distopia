import { Base } from "./Base";

export class RoleController extends Base {
  // Ids only (not full GuildMember objects) -- every caller (AppCore.updateHomeGuild*Role)
  // only ever reads `.id`, and this needs to be protobuf-friendly to be served over RPC
  // once presentation-bot owns the live client.
  public async fetchGuild(guildId: string, roleId: string): Promise<string[]> {
    return (
      this.client.guilds.cache
        .get(guildId)
        ?.roles.cache.get(roleId)
        ?.members.map((member) => member.id) ?? []
    );
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
