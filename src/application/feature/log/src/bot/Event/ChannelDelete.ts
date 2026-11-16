import type { FeatureEventListener } from "presentation-bot-kit/feature";

import { sendLog } from "../sendLog";

export const channelDelete: FeatureEventListener<"channelDelete"> = async (core, channel) => {
  if (channel.isDMBased()) {
    return;
  }

  await sendLog(core, channel.guild, "logChannelDelete", channel);
};
