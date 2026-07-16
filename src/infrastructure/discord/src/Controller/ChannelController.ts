import { ChannelType, PermissionFlagsBits, type GuildMember } from "discord.js";

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

  public async rename(channelId: string, name: string): Promise<boolean> {
    const channel = this.client.channels.cache.get(channelId);

    if (!channel?.isVoiceBased()) {
      return false;
    }

    if (!channel.guild.members.me?.permissionsIn(channel).has(PermissionFlagsBits.ManageChannels)) {
      console.error(`Missing ManageChannels permission to rename channel ${channelId}`);
      return true;
    }

    if (channel.name !== name) {
      await channel.setName(name);
    }

    return true;
  }

  public existsVoiceChannel(channelId: string): boolean {
    const channel = this.client.channels.cache.get(channelId);
    return channel?.isVoiceBased() ?? false;
  }

  public async create(guildId: string, name: string): Promise<{ id: string } | null> {
    const guild = this.client.guilds.cache.get(guildId);

    if (!guild) {
      return null;
    }

    const channel = await guild.channels.create({
      name,
      type: ChannelType.GuildVoice,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.Connect],
        },
      ],
    });

    return { id: channel.id };
  }
}
