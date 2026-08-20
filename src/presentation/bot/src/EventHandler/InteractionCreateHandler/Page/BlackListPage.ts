import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type InteractionReplyOptions,
} from "discord.js";
import type { Guild } from "domain-model";

import { blackListActionLabels, buildBlackListFieldValue } from "../../../utils/blackList";
import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";

export async function blackListPage(core: AppCore, guild: Guild): Promise<InteractionReplyOptions> {
  const [settings, applied] = await Promise.all([
    core.guild.getSetting(guild.id),
    core.blackList.getApplied(guild.id),
  ]);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("ブラックリスト設定")
    .setDescription(
      "自分がオーナー・編集者になっているブラックリストをこのサーバーに適用できます。\nブラックリストのIDは `/blacklist list` で確認できます。",
    )
    .addFields(
      {
        name: "適用中のブラックリスト",
        value: buildBlackListFieldValue(
          applied.map(
            (entry) => `ID: \`${entry.blackListId}\` (${blackListActionLabels[entry.action]})`,
          ),
        ),
      },
      {
        name: "ログチャンネル",
        value: settings?.logBlackList ? `<#${settings.logBlackList}>` : "未設定",
      },
    );

  const applyButton = new ButtonBuilder()
    .setCustomId("blackListApplyOpen")
    .setLabel("適用・更新する")
    .setStyle(ButtonStyle.Primary);

  const resetLogChannelButton = new ButtonBuilder()
    .setCustomId("blackListLogChannelReset")
    .setLabel("ログチャンネルをリセット")
    .setStyle(ButtonStyle.Danger);

  const components: (
    | ActionRowBuilder<ButtonBuilder>
    | ActionRowBuilder<StringSelectMenuBuilder>
    | ActionRowBuilder<ChannelSelectMenuBuilder>
  )[] = [new ActionRowBuilder<ButtonBuilder>().addComponents(applyButton)];

  if (applied.length) {
    const manageSelector = new StringSelectMenuBuilder()
      .setCustomId("blackListManage")
      .setPlaceholder("解除するブラックリストを選択")
      .addOptions(
        applied
          .slice(0, 25)
          .map((entry) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(`ID: ${entry.blackListId} (${blackListActionLabels[entry.action]})`)
              .setValue(String(entry.blackListId)),
          ),
      );

    components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(manageSelector));
  }

  components.push(
    new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId("blackListLogChannel")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      await backSettingsPageButton(),
      resetLogChannelButton,
    ),
  );

  return {
    embeds: [embed],
    components,
  };
}
