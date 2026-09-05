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
      this.leaveIfVoiceChannelEmpty(oldState);
    }

    if (newState.channelId) {
      await this.logger.log(newState.guild, "logVoiceJoin", memberId, newState.channelId);
    }
  }

  // If the bot's own TTS session is bound to the channel someone just left, and no human
  // members remain (the bot itself still counts as a member of the channel it's connected
  // to), disconnect rather than keep an idle voice connection open.
  private leaveIfVoiceChannelEmpty(oldState: VoiceState): void {
    const session = getSession(oldState.guild.id);
    if (!session || session.voiceChannelId !== oldState.channelId) {
      return;
    }

    const hasHumanMembers = Boolean(oldState.channel?.members.some((member) => !member.user.bot));
    if (!hasHumanMembers) {
      leave(oldState.guild.id);
    }
  }
}
