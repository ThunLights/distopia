import type { GuildMember } from "discord.js";

import { Base } from "./Base";

export class ChannelController extends Base {
  public isActiveMember(member: GuildMember) {
    return !member.user.bot && !(member.voice.mute || member.voice.deaf);
  }

  public async fetchVoiceChannel() {
    const voiceChannels = this.client.channels.cache
      .values()
      .toArray()
      .filter((channel) => channel.isVoiceBased())
      .map((vc) => ({
        guildId: vc.guildId,
        channelId: vc.id,
        members: vc.members.map((member) => ({
          id: member.id,
          isActive: this.isActiveMember(member),
        })),
        activeMemberCount: vc.members.filter(this.isActiveMember).size,
        memberCount: vc.members.size,
      }));

    return voiceChannels;
  }
}
