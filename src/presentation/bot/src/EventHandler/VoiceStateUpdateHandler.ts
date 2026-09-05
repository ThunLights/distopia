import type { VoiceState } from "discord.js";

import { getSession, leave } from "../utils/tts/session";
import { BaseHandler } from "./BaseHandler";

export class VoiceStateUpdateHandler extends BaseHandler<
  (oldState: VoiceState, newState: VoiceState) => void
> {
  public override async handle(oldState: VoiceState, newState: VoiceState): Promise<void> {
    if (oldState.channelId === newState.channelId) {
      return;
    }

    const memberId = newState.id;

    if (oldState.channelId) {
      await this.logger.log(newState.guild, "logVoiceLeave", memberId, oldState.channelId);
      await this.leaveIfVoiceChannelEmpty(oldState);
    }

    if (newState.channelId) {
      await this.logger.log(newState.guild, "logVoiceJoin", memberId, newState.channelId);
    }
  }

  // If the bot's own TTS session is bound to the channel someone just left, and no human
  // members remain (the bot itself still counts as a member of the channel it's connected
  // to), disconnect rather than keep an idle voice connection open.
  private async leaveIfVoiceChannelEmpty(oldState: VoiceState): Promise<void> {
    const session = getSession(oldState.guild.id);
    if (!session || session.voiceChannelId !== oldState.channelId) {
      return;
    }

    const channel = oldState.channel;
    if (!channel) {
      await leave(oldState.guild.id);
      return;
    }

    // `channel.members` is derived from the guild's member cache, which can miss members
    // whose full GuildMember object hasn't been cached even though their voice state is
    // known (voice states are authoritative via the GuildVoiceStates intent regardless of
    // member caching). If the resolved member count doesn't match the raw voice-state count
    // for this channel, at least one occupant couldn't be checked for bot-ness -- treat that
    // as "might still have a human" rather than risk disconnecting while someone's present.
    const voiceStateCount = oldState.guild.voiceStates.cache.filter(
      (voiceState) => voiceState.channelId === channel.id,
    ).size;
    const memberFlags = channel.members.map((member) => ({ bot: member.user.bot }));

    if (isConfirmedEmptyOfHumans(memberFlags, voiceStateCount)) {
      await leave(oldState.guild.id);
    }
  }
}

// Pure and independently testable: true only when every voice-state occupant resolved to a
// cached member and none of them are human. See leaveIfVoiceChannelEmpty's comment for why
// an unresolved occupant must not be treated as "channel is empty".
export function isConfirmedEmptyOfHumans(
  members: { bot: boolean }[],
  voiceStateCount: number,
): boolean {
  if (members.length !== voiceStateCount) {
    return false;
  }
  return members.every((member) => member.bot);
}
