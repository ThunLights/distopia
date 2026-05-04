import type { GuildRecordOneDayUpsertInput } from "infra-database/types";

import { Base } from "./Base";
import { formatYMD } from "./utils/date";

export class Member extends Base {
  public async addNewMember(guildId: string, memberId: string) {
    const data = this.state.memory.guildMemberAdd.get(guildId);
    this.state.memory.guildMemberAdd.set(guildId, {
      memberIds: Array.from(new Set([...(data?.memberIds ?? []), memberId])),
      updatedAt: new Date(),
    });
  }

  public async syncDB() {
    const date = await formatYMD(new Date());
    const query: GuildRecordOneDayUpsertInput[] = [];
    const records = new Map(
      (await this.state.database.guildRecordOneDay.findFixedTimesAll(date)).map((value) => [
        value.guildId,
        value,
      ]),
    );

    for (const [guildId, value] of this.state.memory.guildMemberAdd.entries()) {
      const record = records.get(guildId);

      query.push({
        guildId,
        date,
        newMembers: Array.from(new Set([...(record?.vcMembers ?? []), ...value.memberIds])),
      });

      this.state.memory.guildMemberAdd.delete(guildId);
    }

    await this.state.database.guildRecordOneDay.upsertAll(query);
  }
}
