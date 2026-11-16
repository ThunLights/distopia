import type { FeatureEventListener } from "presentation-bot-kit/feature";

import { sendLog } from "../sendLog";

export const channelUpdate: FeatureEventListener<"channelUpdate"> = async (
  core,
  oldChannel,
  newChannel,
) => {
  if (oldChannel.isDMBased() || newChannel.isDMBased()) {
    return;
  }

  const changes: string[] = [];

  if (oldChannel.name !== newChannel.name) {
    changes.push(`名前: ${oldChannel.name} → ${newChannel.name}`);
  }

  if ("topic" in oldChannel && "topic" in newChannel && oldChannel.topic !== newChannel.topic) {
    changes.push("トピックが変更されました。");
  }

  if (changes.length === 0) {
    return;
  }

  await sendLog(core, newChannel.guild, "logChannelEdit", newChannel, changes);
};
