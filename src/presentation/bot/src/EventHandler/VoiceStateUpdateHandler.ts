import type { VoiceState } from "discord.js";

import { enqueue, getSession, leave } from "../utils/tts/session";
import { BaseHandler } from "./BaseHandler";

export class VoiceStateUpdateHandler extends BaseHandler<
  (oldState: VoiceState, newState: VoiceState) => void
> {
  public override async handle(oldState: VoiceState, newState: VoiceState): Promise<void> {
    if (oldState.channelId === newState.channelId) {
      return;
    }

    const memberId = newState.id;

    // Read before leaveIfVoiceChannelEmpty, which can destroy the session (and thus make
    // getSession return undefined) when this update is the last human leaving the channel.
    await this.announceVoiceStateChange(oldState, newState);

    if (oldState.channelId) {
      await this.logger.log(newState.guild, "logVoiceLeave", memberId, oldState.channelId);
      await this.leaveIfVoiceChannelEmpty(oldState);
    }

    if (newState.channelId) {
      await this.logger.log(newState.guild, "logVoiceJoin", memberId, newState.channelId);
    }
  }

  private async announceVoiceStateChange(
    oldState: VoiceState,
    newState: VoiceState,
  ): Promise<void> {
    const memberId = newState.id;
    if (memberId === newState.client.user.id) {
      return;
    }

    const guildId = newState.guild.id;
    const session = getSession(guildId);
    if (!session) {
      return;
    }

    const oldChannelId = oldState.channelId;
    const newChannelId = newState.channelId;
    if (oldChannelId !== session.voiceChannelId && newChannelId !== session.voiceChannelId) {
      return;
    }

    let text: string;
    if (!oldChannelId && newChannelId === session.voiceChannelId) {
      text = "が入室しました";
    } else if (oldChannelId === session.voiceChannelId && !newChannelId) {
      text = "が退出しました";
    } else if (oldChannelId && newChannelId && oldChannelId !== newChannelId) {
      text = "が移動しました";
    } else {
      return;
    }

    const member =
      newState.member ??
      oldState.member ??
      (await newState.guild.members.fetch(memberId).catch(() => null));
    const displayName = member?.displayName ?? "誰か";

    const speakerId = await this.core.tts.getEffectiveSpeakerId(guildId, memberId);
    enqueue(
      guildId,
      session.textChannelId,
      `${displayName}さん${text}`,
      speakerId,
      (word, speaker) => this.core.tts.synthesize(word, speaker, guildId),
    );
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

    // `channel.members` (member cache) can miss occupants whose voice state is known -- voice
    // states are authoritative via GuildVoiceStates regardless of member caching. A mismatch
    // between resolved member count and raw voice-state count means an occupant's bot-ness is
    // unverifiable -- assume a human is present rather than risk disconnecting.
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
