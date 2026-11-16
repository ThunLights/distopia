import type { FeatureEventListener } from "presentation-bot-kit/feature";

import { sendLog } from "../sendLog";

export const channelCreate: FeatureEventListener<"channelCreate"> = async (core, channel) => {
  await sendLog(core, channel.guild, "logChannelCreate", channel);
};
