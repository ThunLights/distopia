import { levelUpSync } from "domain-service";

import { Base } from "./Base";
import { formatYMD } from "./utils/date";

export type UpsertVcMembersQuery = {
  guildId: string;
  vcMember: string;
}[];

export type UpsertQuery = {
  guildId: string;
  plusPoint: number;
}[];

export class VoiceChannel extends Base {
  // Known gap: VoiceChannelMember.pushMemberCounts does its own get()-then-set() internally
  // (see VoiceChannelMember.ts) -- same class of race as Message.increase(). update() only
  // calls it once per guild per run here, so in practice this would require two overlapping
  // update() runs, which setScheduleTask's cron already serializes -- listed for
  // completeness, not because it's currently reachable.
  public async update() {
    const upsertVcMemberUpperTwoQuery: string[] = [];
    const upsertVcMembersQuery: UpsertVcMembersQuery = [];
    const upsertQuery: UpsertQuery = [];
    const voiceChannels = await this.state.discord.channel.fetchVoiceChannel();

    for (const vc of voiceChannels) {
      if (vc.activeMemberCount >= 2) {
        upsertVcMemberUpperTwoQuery.push(vc.guildId);
      }
      for (const member of vc.members.filter((member) => member.isActive)) {
        upsertVcMembersQuery.push({
          guildId: vc.guildId,
          vcMember: member.id,
        });
      }

      await this.state.memory.voiceChannelMember.pushMemberCounts(vc.guildId, vc.activeMemberCount);
    }

    for (const [guildId, value] of await this.state.memory.voiceChannelMember.entries()) {
      if (voiceChannels.map(({ guildId }) => guildId).includes(guildId)) {
        const plusPoint =
          value.memberCounts.reduce((sum, e) => sum + e, 0) / value.memberCounts.length;

        upsertQuery.push({
          guildId,
          plusPoint,
        });
      } else {
        await this.state.memory.voiceChannelMember.delete(guildId);
      }
    }

    const records = new Map(
      (await this.state.database.guildRecord.findAll()).map(({ guildId, level, point }) => [
        guildId,
        { guildId, level, point },
      ]),
    );

    await this.state.database.guildRecordOneDay.upsertVcMemberUpperTwoAll(
      upsertVcMemberUpperTwoQuery,
      await formatYMD(new Date()),
    );
    await this.state.database.guildRecordOneDay.upsertVcMembersAll(
      upsertVcMembersQuery,
      await formatYMD(new Date()),
    );
    await this.state.database.guildRecord.upsertAll(
      upsertQuery.map(({ guildId, plusPoint }) => {
        const record = records.get(guildId);
        const { level, point } = levelUpSync(
          record?.level ?? 0n,
          record?.point ?? 0n,
          BigInt(Math.ceil(plusPoint) * 20),
        );

        return { guildId, level, point };
      }),
    );
  }
}
