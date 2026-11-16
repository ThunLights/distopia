import type { FeatureEventListener } from "presentation-bot-kit/feature";

import { sendLog } from "../sendLog";

export const guildMemberAdd: FeatureEventListener<"guildMemberAdd"> = async (core, member) => {
  await sendLog(core, member.guild, "logMemberJoin", member);
};
