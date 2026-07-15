import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  UserSelectMenuBuilder,
  type InteractionReplyOptions,
} from "discord.js";
import type { Guild } from "domain-model";

import {
  buildWhiteListFieldValue,
  encodeWhiteListTarget,
  idTypeLabel,
  mention,
  SELECT_MENU_MAX_OPTIONS,
  truncateSelectMenuLabel,
} from "../../../utils/whiteList";
import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";

export async function whiteListPage(core: AppCore, guild: Guild): Promise<InteractionReplyOptions> {
  const whiteList = await core.guild.getWhiteList(guild.id);

  const names = await Promise.all(
    whiteList.map((entry) =>
      core.state.discord.guild.fetchWhiteListTargetName(guild.id, entry.idType, entry.targetId),
    ),
  );

  const whiteListLines = whiteList.map((entry, index) => {
    const name = names[index];
    const permissionSummary = entry.allPermissions
      ? "全許可"
      : entry.permissions.join(", ") || "権限なし";

    return `${mention(entry.idType, entry.targetId)}${name ? ` (${name})` : ""} [${
      idTypeLabel[entry.idType]
    }] - ${permissionSummary}`;
  });

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("ホワイトリスト設定")
    .setDescription(
      "登録したチャンネル・ロール・ユーザーは招待リンクブロックなどのスパム検知の対象外になります。",
    )
    .addFields({
      name: "現在のホワイトリスト",
      value: buildWhiteListFieldValue(whiteListLines),
    });

  const addUserSelector = new UserSelectMenuBuilder()
    .setCustomId("whiteListAddUser")
    .setPlaceholder("ユーザーを追加")
    .setMaxValues(1);

  const addRoleSelector = new RoleSelectMenuBuilder()
    .setCustomId("whiteListAddRole")
    .setPlaceholder("ロールを追加")
    .setMaxValues(1);

  const addChannelSelector = new ChannelSelectMenuBuilder()
    .setCustomId("whiteListAddChannel")
    .setPlaceholder("チャンネルを追加")
    .setMaxValues(1)
    .addChannelTypes(
      ChannelType.GuildText,
      ChannelType.GuildAnnouncement,
      ChannelType.PublicThread,
      ChannelType.PrivateThread,
      ChannelType.AnnouncementThread,
    );

  const components: (
    | ActionRowBuilder<UserSelectMenuBuilder>
    | ActionRowBuilder<RoleSelectMenuBuilder>
    | ActionRowBuilder<ChannelSelectMenuBuilder>
    | ActionRowBuilder<StringSelectMenuBuilder>
    | ActionRowBuilder<ButtonBuilder>
  )[] = [
    new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(addUserSelector),
    new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(addRoleSelector),
    new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(addChannelSelector),
  ];

  if (whiteList.length) {
    const manageSelector = new StringSelectMenuBuilder()
      .setCustomId("whiteListManage")
      .setPlaceholder("編集/削除する対象を選択")
      .addOptions(
        whiteList.slice(0, SELECT_MENU_MAX_OPTIONS).map((entry, index) => {
          const name = names[index];

          return new StringSelectMenuOptionBuilder()
            .setLabel(
              truncateSelectMenuLabel(
                `${idTypeLabel[entry.idType]}: ${name ?? entry.targetId}${name ? ` (${entry.targetId})` : ""}`,
              ),
            )
            .setValue(encodeWhiteListTarget(entry.idType, entry.targetId));
        }),
      );

    components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(manageSelector));
  }

  components.push(
    new ActionRowBuilder<ButtonBuilder>().addComponents(await backSettingsPageButton()),
  );

  return {
    embeds: [embed],
    components,
  };
}
