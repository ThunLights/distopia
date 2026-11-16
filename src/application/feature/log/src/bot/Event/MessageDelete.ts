import type { FeatureEventListener } from "presentation-bot-kit/feature";

import { sendLog } from "../sendLog";

export const messageDelete: FeatureEventListener<"messageDelete"> = async (core, message) => {
  if (!message.guild || message.partial || message.author.bot) {
    return;
  }

  const content = message.content || "(空)";

  await sendLog(core, message.guild, "logMessageDelete", message, content);
};
