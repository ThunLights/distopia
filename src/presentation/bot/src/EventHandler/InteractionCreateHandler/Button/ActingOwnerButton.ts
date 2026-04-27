import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  UserSelectMenuBuilder,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";

export class ActingOwnerButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "actingOwner";

  protected override async exec(
    _interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload> {
    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle("オーナー代理設定")
      .setDescription(
        "特定のユーザーに対してオーナー代理を設定すると解除するまでDistopiaサービスでオーナーと同等の権限を持ちます。",
      );

    const userSelector = new UserSelectMenuBuilder().setCustomId("actingOwner").setMaxValues(1);

    const resetButton = new ButtonBuilder()
      .setCustomId("actingOwnerReset")
      .setLabel("自分に権限を戻す。")
      .setStyle(ButtonStyle.Danger);

    return {
      embeds: [embed],
      components: [
        new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelector),
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          await backSettingsPageButton(),
          resetButton,
        ),
      ],
      flags: [MessageFlags.Ephemeral],
    };
  }
}
