import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  UserSelectMenuBuilder,
  type InteractionReplyOptions,
} from "discord.js";
import { backSettingsPageButton } from "presentation-bot-kit/component/BackSettingsPageButton";

export async function actingOwnerPage(): Promise<InteractionReplyOptions> {
  const embed = new EmbedBuilder()
    .setColor("Blurple")
    .setTitle("オーナー代理設定")
    .setDescription(
      "特定のユーザーに対してオーナー代理を設定すると解除するまでDistopiaサービスでオーナーと同等の権限を持ちます。",
    );
  const userSelector = new UserSelectMenuBuilder().setCustomId("actingOwner").setMaxValues(1);

  const resetButton = new ButtonBuilder()
    .setCustomId("actingOwnerReset")
    .setLabel("自分に権限を戻す")
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
  };
}
