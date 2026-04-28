import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  InteractionResponse,
  RoleSelectMenuBuilder,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";

export class BumpRoleButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "bumpRoleButton";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const embed = new EmbedBuilder()
      .setColor("Navy")
      .setTitle("Bump通知: ロール")
      .setDescription("再Bump可能時にロールをメンションします。");

    const roleSelector = new RoleSelectMenuBuilder().setCustomId("bumpRole");

    const resetButton = new ButtonBuilder()
      .setLabel("ロールをリセットする")
      .setStyle(ButtonStyle.Danger)
      .setCustomId("bumpRoleReset");

    return await interaction.update({
      embeds: [embed],
      components: [
        new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelector),
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          await backSettingsPageButton(),
          resetButton,
        ),
      ],
    });
  }
}
