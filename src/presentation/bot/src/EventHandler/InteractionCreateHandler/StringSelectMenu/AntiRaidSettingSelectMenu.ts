import {
  type StringSelectMenuInteraction,
  type CacheType,
  type MessagePayload,
  type InteractionReplyOptions,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
  type PermissionResolvable,
  InteractionResponse,
} from "discord.js";

import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";

const backAntiRaidPageButton = () =>
  new ButtonBuilder()
    .setCustomId("backAntiRaidPage")
    .setStyle(ButtonStyle.Danger)
    .setLabel("荒らし対策設定に戻る");

export class AntiRaidSettingSelectMenu extends StringSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "antiRaidSetting";

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: { value: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const { value } = options;

    if (value === "inviteLinkBlock") {
      const embed = new EmbedBuilder()
        .setColor("Navy")
        .setTitle("招待リンクブロック")
        .setDescription("招待リンクをブロックすることが出来ます。");

      const onButton = new ButtonBuilder()
        .setCustomId("inviteLinkBlockOn")
        .setLabel("On")
        .setStyle(ButtonStyle.Success);
      const offButton = new ButtonBuilder()
        .setCustomId("inviteLinkBlockOff")
        .setLabel("Off")
        .setStyle(ButtonStyle.Danger);

      return await interaction.update({
        embeds: [embed],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            backAntiRaidPageButton(),
            offButton,
            onButton,
          ),
        ],
      });
    }

    return {
      content: `${value}は無効な選択肢です`,
      flags: [MessageFlags.Ephemeral],
    };
  }
}
