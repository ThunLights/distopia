import { calcActiveRate } from "domain-service";
import type { GuildRecordOneDay, GuildRecordUpsertInput } from "infra-database/types";

import { Base } from "./Base";

export class ActiveRate extends Base {
  public async update() {
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = new Date(Date.now() - thirtyDays);
    const query: GuildRecordUpsertInput[] = [];

    const allGuildRecord =
      await this.state.database.guildRecordOneDay.findFixedTimesAll(thirtyDaysAgo);

    for (const guild of await this.state.database.guild.findAll()) {
      const records = await (async () => {
        const records: GuildRecordOneDay[] = [];

        for (const record of allGuildRecord) {
          if (record.guildId === guild.guildId) {
            records.push(record);
          }
        }

        return records;
      })();

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
