import type { FeatureEventListener } from "presentation-bot-kit/feature";

import { sendLog } from "../sendLog";

export const roleDelete: FeatureEventListener<"roleDelete"> = async (core, role) => {
  await sendLog(core, role.guild, "logRoleDelete", role);
};
