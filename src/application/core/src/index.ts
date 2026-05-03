import { ActiveRate } from "./ActiveRate";
import { Base } from "./Base";
import { Friend } from "./Friend";
import { Guild } from "./Guild";
import { Memory } from "./Memory";
import { Panel } from "./Panel";
import { Ranking } from "./Ranking";
import { Record } from "./Record";
import { Voice } from "./Voice";

export class AppCore extends Base {
  public readonly activeRate = new ActiveRate(this.state);
  public readonly guild = new Guild(this.state);
  public readonly friend = new Friend(this.state);
  public readonly memory = new Memory(this.state);
  public readonly panel = new Panel(this.state);
  public readonly ranking = new Ranking(this.state);
  public readonly record = new Record(this.state);
  public readonly voice = new Voice(this.state);

  private async updateHomeGuildSpecialDirectorsRole(
    homeGuildId: string,
    specialDirectorsRoleId: string,
  ) {
    const ownerIds = new Set<string>();

    for (const guild of await this.ranking.fetchGuild("activeRate", { num: 10 })) {
      const owner = await this.state.discord.guild.fetchOwner(guild.guildId);
      const ownerId = owner?.id;
      if (ownerId) {
        ownerIds.add(ownerId);
      }
    }

    for (const ownerId of ownerIds) {
      await this.state.discord.role.give(homeGuildId, ownerId, specialDirectorsRoleId);
    }

    for (const user of (
      await this.state.discord.role.fetchGuild(homeGuildId, specialDirectorsRoleId)
    )
      ?.values()
      .toArray() ?? []) {
      if (!Array.from(ownerIds).includes(user.id)) {
        await this.state.discord.role.deprive(homeGuildId, user.id, specialDirectorsRoleId);
      }
    }
  }

  private async updateHomeGuildDirectorsRole(homeGuildId: string, directorsRoleId: string) {
    const ownerIds = new Set<string>();

    for (const guild of await this.ranking.fetchGuild("activeRate", { num: 100 })) {
      const owner = await this.state.discord.guild.fetchOwner(guild.guildId);
      const ownerId = owner?.id;
      if (ownerId) {
        ownerIds.add(ownerId);
      }
    }

    for (const ownerId of ownerIds) {
      await this.state.discord.role.give(homeGuildId, ownerId, directorsRoleId);
    }

    for (const user of (await this.state.discord.role.fetchGuild(homeGuildId, directorsRoleId))
      ?.values()
      .toArray() ?? []) {
      if (!Array.from(ownerIds).includes(user.id)) {
        await this.state.discord.role.deprive(homeGuildId, user.id, directorsRoleId);
      }
    }
  }

  private async updateHomeGuildSubDirectorsRole(homeGuildId: string, subDirectorsRoleId: string) {
    const adminIds = new Set<string>();

    for (const guild of await this.ranking.fetchGuild("activeRate", { num: 100 })) {
      const admins =
        (await this.state.discord.guild.fetchHasPermissionUsers(guild.guildId, ["Administrator"]))
          ?.values()
          .toArray() ?? [];
      for (const admin of admins) {
        adminIds.add(admin.id);
      }
    }

    for (const adminId of adminIds) {
      await this.state.discord.role.give(homeGuildId, adminId, subDirectorsRoleId);
    }

    for (const user of (await this.state.discord.role.fetchGuild(homeGuildId, subDirectorsRoleId))
      ?.values()
      .toArray() ?? []) {
      if (!Array.from(adminIds).includes(user.id)) {
        await this.state.discord.role.deprive(homeGuildId, user.id, subDirectorsRoleId);
      }
    }
  }

  public async updateHomeGuildRoles(
    homeGuildId: string,
    specialDirectorsRoleId: string,
    directorsRoleId: string,
    subDirectorsRoleId: string,
  ) {
    await this.updateHomeGuildSpecialDirectorsRole(homeGuildId, specialDirectorsRoleId);
    await this.updateHomeGuildDirectorsRole(homeGuildId, directorsRoleId);
    await this.updateHomeGuildSubDirectorsRole(homeGuildId, subDirectorsRoleId);
  }
}
