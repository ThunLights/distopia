import type { Role } from "discord.js";

import { sendLog } from "../utils/sendLog";
import { BaseHandler } from "./BaseHandler";

export class RoleUpdateHandler extends BaseHandler<(oldRole: Role, newRole: Role) => void> {
  public override async handle(oldRole: Role, newRole: Role): Promise<void> {
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

    await sendLog(
      this.core,
      newRole.guild,
      "logRoleEdit",
      "ロール編集",
      [`<@&${newRole.id}> (${newRole.name}) が編集されました。`, ...changes].join("\n"),
    );
  }
}
