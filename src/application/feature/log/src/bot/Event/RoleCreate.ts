import type { FeatureEventListener } from "presentation-bot-kit/feature";

import { sendLog } from "../sendLog";

export const roleCreate: FeatureEventListener<"roleCreate"> = async (core, role) => {
  await sendLog(core, role.guild, "logRoleCreate", role);
};
