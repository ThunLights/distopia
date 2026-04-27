import { ButtonBuilder, ButtonStyle } from "discord.js";

export async function backSettingsPageButton(): Promise<ButtonBuilder> {
  return new ButtonBuilder()
    .setCustomId("backSettingsPage")
    .setStyle(ButtonStyle.Danger)
    .setLabel("設定画面に戻る");
}
