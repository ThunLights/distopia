import type { FeatureEventListener } from "presentation-bot-kit/feature";

import { sendLog } from "../sendLog";

export const roleUpdate: FeatureEventListener<"roleUpdate"> = async (core, oldRole, newRole) => {
  const changes: string[] = [];

  if (oldRole.name !== newRole.name) {
    changes.push(`名前: ${oldRole.name} → ${newRole.name}`);
  }
  if (oldRole.hexColor !== newRole.hexColor) {
    changes.push(`カラー: ${oldRole.hexColor} → ${newRole.hexColor}`);
  }
  if (oldRole.hoist !== newRole.hoist) {
    changes.push(
      `表示設定: ${oldRole.hoist ? "分離表示" : "統合表示"} → ${newRole.hoist ? "分離表示" : "統合表示"}`,
    );
  }
  if (oldRole.mentionable !== newRole.mentionable) {
    changes.push(
      `メンション可否: ${oldRole.mentionable ? "可" : "不可"} → ${newRole.mentionable ? "可" : "不可"}`,
    );
  }
  if (!oldRole.permissions.equals(newRole.permissions)) {
    changes.push("権限が変更されました。");
  }

  if (changes.length === 0) {
    return;
  }

  await sendLog(core, newRole.guild, "logRoleEdit", newRole, changes);
};
