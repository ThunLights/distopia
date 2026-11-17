import type { VoiceState } from "discord.js";
import { EventPriority, FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

import { sendLog } from "../sendLog";

export class VoiceStateUpdateEvent extends FeatureEventBase<"voiceStateUpdate"> {
  public override readonly event = "voiceStateUpdate";
  public override readonly priority = EventPriority.Logging;

  public override async handle(oldState: VoiceState, newState: VoiceState) {
    if (oldState.channelId === newState.channelId) {
      return;
    }

    if (oldState.channelId) {
      await sendLog(this.core, newState.guild, "logVoiceLeave", newState.id, oldState.channelId);
    }
    if (newState.channelId) {
      await sendLog(this.core, newState.guild, "logVoiceJoin", newState.id, newState.channelId);
    }
  }
}
