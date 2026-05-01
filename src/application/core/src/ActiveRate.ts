import { calcActiveRate } from "domain-service";
import type { GuildRecordUpsertInput } from "infra-database/types";

import { Base } from "./Base";

export class ActiveRate extends Base {
  public async update() {
    const query: GuildRecordUpsertInput[] = [];

    for (const guild of await this.state.database.guild.findAll()) {
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      const thirtyDaysAgo = new Date(Date.now() - thirtyDays);
      const records = await this.state.database.guildRecordOneDay.findFixedTimes(
        guild.guildId,
        thirtyDaysAgo,
      );

      const newMember = records.reduce((sum, record) => sum + record.newMembers.length, 0);
      const newMessage = records.reduce((sum, record) => sum + record.newMessages, 0);
      const vcMemberSum = new Set(records.map((value) => value.vcMembers).flat()).size;
      const vcMemberUpperTwo = records.reduce((sum, record) => sum + record.vcMemberUpperTwo, 0);
      const activeMember =
        (await this.state.discord.guild.fetchMemberCount(guild.guildId, ["online"])) ?? 0;
      const allMember = (await this.state.discord.guild.fetchMemberCount(guild.guildId)) ?? 0;

      const rate = await calcActiveRate({
        newMember,
        newMessage,
        vcMemberSum,
        vcMemberUpperTwo,
        activeMember,
        allMember,
      });

      query.push({
        guildId: guild.guildId,
        activeRate: BigInt(rate),
      });
    }

    await this.state.database.guildRecord.upsertAll(query);
  }
}
