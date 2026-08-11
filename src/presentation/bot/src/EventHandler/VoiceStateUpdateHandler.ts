import type { VoiceState } from "discord.js";

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
    }

    if (newState.channelId) {
      await this.logger.log(newState.guild, "logVoiceJoin", memberId, newState.channelId);
    }
  }
}
