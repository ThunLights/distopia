import {
  DiscordAPIError,
  InteractionResponse,
  RESTJSONErrorCodes,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type PermissionResolvable,
  type StringSelectMenuInteraction,
} from "discord.js";
import { StringSelectMenuInteractionBase } from "presentation-bot-kit/base/StringSelectMenuInteractionBase";

import { ROLE_PANEL_CUSTOM_ID } from "../../../utils/rolePanel";

const BOT_PERMISSION_HINT =
  "\nサーバー管理者に、ボットの「ロールの管理」権限と役職の順位を確認するよう伝えてください。";

export class RolePanelSelectMenu extends StringSelectMenuInteractionBase {
  public override requireBotGuildPermissions: PermissionResolvable[] = ["ManageRoles"];
  public override customId: string = ROLE_PANEL_CUSTOM_ID;

  // The base validates only the first value; with min_values 0 there may be none.
  public override async parseOptions() {
    return { value: "" };
  }

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
  ): Promise<InteractionReplyOptions | InteractionResponse> {
    const { guild } = interaction;
    if (!guild) {
      return { content: "サーバー内で実行してください。", flags: [MessageFlags.Ephemeral] };
    }

    // Re-sending the components clears the user's selection so the same role can be toggled again.
    const response = await interaction.update({ components: interaction.message.components });
    if (interaction.values.length === 0) {
      return response;
    }

    const member = await guild.members.fetch(interaction.user.id);
    const lines: string[] = [];
    for (const roleId of interaction.values) {
      const role = guild.roles.cache.get(roleId);
      if (!role || role.managed) {
        lines.push(`⚠️ <@&${roleId}> は付与できません。`);
        continue;
      }
      if (!role.editable) {
        lines.push(
          `⚠️ <@&${roleId}> はボットの役職より上位のため付与できません。${BOT_PERMISSION_HINT}`,
        );
        continue;
      }
      try {
        if (member.roles.cache.has(roleId)) {
          await member.roles.remove(role);
          lines.push(`➖ <@&${roleId}> を外しました。`);
        } else {
          await member.roles.add(role);
          lines.push(`➕ <@&${roleId}> を付与しました。`);
        }
      } catch (error) {
        lines.push(
          error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.MissingPermissions
            ? `⚠️ ボットの権限不足のため <@&${roleId}> を変更できませんでした。${BOT_PERMISSION_HINT}`
            : `⚠️ <@&${roleId}> の変更に失敗しました。`,
        );
      }
    }

    await interaction.followUp({
      content: lines.join("\n"),
      flags: [MessageFlags.Ephemeral],
      allowedMentions: { parse: [] },
    });
    return response;
  }
}
