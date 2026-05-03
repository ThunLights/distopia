import { levelUp } from "domain-service";

import { Base } from "./Base";
import { formatYMD } from "./utils/date";

export class Voice extends Base {
  public async update() {
    const upsertVcMemberUpperTwoQuery: string[] = [];
    const upsertVcMembersQuery: {
      guildId: string;
      vcMember: string;
    }[] = [];
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

      this.state.memory.voiceChannelMember.pushMemberCounts(vc.guildId, vc.activeMemberCount);
    }

    await this.state.database.guildRecordOneDay.upsertVcMemberUpperTwoAll(
      upsertVcMemberUpperTwoQuery,
      await formatYMD(new Date()),
    );
    await this.state.database.guildRecordOneDay.upsertVcMembersAll(
      upsertVcMembersQuery,
      await formatYMD(new Date()),
    );

    for (const [guildId, value] of this.state.memory.voiceChannelMember.entries()) {
      if (voiceChannels.map(({ guildId }) => guildId).includes(guildId)) {
        const data = await this.state.database.guildRecord.find(guildId);
        const plusPoint =
          value.memberCounts.reduce((sum, e) => sum + e, 0) / value.memberCounts.length;

        const { level, point } = await levelUp(
          data?.level ?? 0n,
          data?.point ?? 0n,
          BigInt(Math.ceil(plusPoint) * 20),
        );

        return await this.state.database.guildRecord.upsert({ guildId, level, point });
      } else {
        this.state.memory.voiceChannelMember.delete(guildId);
      }
    }
  }
}
