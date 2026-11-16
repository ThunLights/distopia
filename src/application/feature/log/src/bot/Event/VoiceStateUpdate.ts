import type { FeatureEventListener } from "presentation-bot-kit/feature";

import { sendLog } from "../sendLog";

export const voiceStateUpdate: FeatureEventListener<"voiceStateUpdate"> = async (
  core,
  oldState,
  newState,
) => {
  if (oldState.channelId === newState.channelId) {
    return;
  }

  if (oldState.channelId) {
    await sendLog(core, newState.guild, "logVoiceLeave", newState.id, oldState.channelId);
  }

  if (newState.channelId) {
    await sendLog(core, newState.guild, "logVoiceJoin", newState.id, newState.channelId);
  }
};
