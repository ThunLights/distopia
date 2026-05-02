import { levelUp } from "domain-service";

import { Base } from "./Base";
import { formatYMD } from "./utils/date";

export class Voice extends Base {
  public async update() {
    const voiceChannels = await this.state.discord.channel.fetchVoiceChannel();
    for (const vc of voiceChannels) {
      if (vc.activeMemberCount >= 2) {
        await this.state.database.guildRecordOneDay.upsertVcMemberUpperTwo(
          vc.guildId,
          await formatYMD(new Date()),
        );
      }
      for (const member of vc.members.filter((member) => member.isActive)) {
        await this.state.database.guildRecordOneDay.upsertVcMembers(
          vc.guildId,
          await formatYMD(new Date()),
          member.id,
        );
      }

      this.state.memory.voiceChannelMember.pushMemberCounts(vc.guildId, vc.activeMemberCount);
    }

    for (const [guildId, value] of this.state.memory.voiceChannelMember.entries()) {
      if (voiceChannels.map(({ guildId }) => guildId).includes(guildId)) {
        const data = await this.state.database.guildRecord.find(guildId);
        const plusPoint =
          value.memberCounts.reduce((sum, e) => sum + e, 0) / value.memberCounts.length;

        const { level, point } = await levelUp(
          data?.level ?? 0n,
          data?.point ?? 0n,
          BigInt(Math.ceil(plusPoint)),
        );

        return await this.state.database.guildRecord.upsert({ guildId, level, point });
      } else {
        this.state.memory.voiceChannelMember.delete(guildId);
      }
    }
  }
}
