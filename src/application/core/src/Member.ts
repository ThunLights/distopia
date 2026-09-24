import type { GuildRecordOneDayUpsertInput } from "infra-database/types";

import { Base } from "./Base";
import { formatYMD } from "./utils/date";

export class Member extends Base {
  // Known gap: same get()-then-set() race as Message.increase() -- see its comment for why
  // this is safe-enough-for-now (was implicitly atomic under repo-memory's in-process Map,
  // now Redis-backed and racy between concurrent joins to the same guild within one tick;
  // worst case is one missed member in a stats sample, not data loss).
  public async addNewMember(guildId: string, memberId: string) {
    const data = await this.state.memory.guildMemberAdd.get(guildId);
    await this.state.memory.guildMemberAdd.set(guildId, {
      memberIds: Array.from(new Set([...(data?.memberIds ?? []), memberId])),
      updatedAt: new Date(),
    });
  }

  // Known gap: same entries()-then-clear() race as Message.syncDB() -- see its comment.
  public async syncDB() {
    const date = await formatYMD(new Date());
    const query: GuildRecordOneDayUpsertInput[] = [];
    const records = new Map(
      (await this.state.database.guildRecordOneDay.findFixedTimesAll(date)).map((value) => [
        value.guildId,
        value,
      ]),
    );

    for (const [guildId, value] of await this.state.memory.guildMemberAdd.entries()) {
      const record = records.get(guildId);

      query.push({
        guildId,
        date,
        newMembers: Array.from(new Set([...(record?.vcMembers ?? []), ...value.memberIds])),
      });
    }

    await this.state.memory.guildMemberAdd.clear();

    await this.state.database.guildRecordOneDay.upsertAll(query);
  }
}
