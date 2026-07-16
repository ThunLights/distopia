import {
  type StringSelectMenuInteraction,
  type CacheType,
  type MessagePayload,
  type InteractionReplyOptions,
  EmbedBuilder,
  UserSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
  type PermissionResolvable,
  RoleSelectMenuBuilder,
  InteractionResponse,
} from "discord.js";

import { GuildParseError } from "../Base/Error/GuildParseError";
import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";
import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";
import { statChannelPage } from "../Page/StatChannelPage";
import { whiteListPage } from "../Page/WhiteListPage";

export class SettingSelectMenu extends StringSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "setting";

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: { value: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const { value } = options;

    if (value === "actingOwner") {
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

      return await this.safeUpdate(interaction, {
        embeds: [embed],
        components: [
          new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelector),
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            await backSettingsPageButton(),
            resetButton,
          ),
        ],
      });
    } else if (value === "bumpNotice") {
      const embed = new EmbedBuilder()
        .setColor("Navy")
        .setTitle("Bump通知設定")
        .setDescription("以下のボタンから通知設定を変更可能です。");

      const onButton = new ButtonBuilder()
        .setCustomId("bumpNoticeOn")
        .setLabel("通知ON")
        .setStyle(ButtonStyle.Success);

      const offButton = new ButtonBuilder()
        .setCustomId("bumpNoticeOff")
        .setLabel("通知OFF")
        .setStyle(ButtonStyle.Success);

      return await this.safeUpdate(interaction, {
        embeds: [embed],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            await backSettingsPageButton(),
            offButton,
            onButton,
          ),
        ],
      });
    } else if (value === "bumpRole") {
      const embed = new EmbedBuilder()
        .setColor("Navy")
        .setTitle("Bump通知: ロール")
        .setDescription("再Bump可能時にロールをメンションします。");

      const roleSelector = new RoleSelectMenuBuilder().setCustomId("bumpRole");

      const resetButton = new ButtonBuilder()
        .setLabel("ロールをリセットする")
        .setStyle(ButtonStyle.Danger)
        .setCustomId("bumpRoleReset");

      return await this.safeUpdate(interaction, {
        embeds: [embed],
        components: [
          new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelector),
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            await backSettingsPageButton(),
            resetButton,
          ),
        ],
      });
    } else if (value === "bumpNoticeContent") {
      const embed = new EmbedBuilder()
        .setColor("Navy")
        .setTitle("Bumpメッセージ設定")
        .setDescription("Bumpメッセージを設定することができます。");

      const submitButton = new ButtonBuilder()
        .setCustomId("bumpNoticeContentSubmit")
        .setLabel("設定する")
        .setStyle(ButtonStyle.Success);
      const resetButton = new ButtonBuilder()
        .setCustomId("bumpNoticeContentReset")
        .setLabel("リセット")
        .setStyle(ButtonStyle.Danger);

      return await this.safeUpdate(interaction, {
        embeds: [embed],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            await backSettingsPageButton(),
            resetButton,
            submitButton,
          ),
        ],
      });
    } else if (value === "inviteLinkBlock") {
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

      return await this.safeUpdate(interaction, {
        embeds: [embed],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            await backSettingsPageButton(),
            offButton,
            onButton,
          ),
        ],
      });
    } else if (value === "whiteList") {
      const guild = await this.parseGuild(interaction);

      if (guild instanceof GuildParseError) {
        return { content: guild.message, flags: [MessageFlags.Ephemeral] };
      }

      const whiteListPagePayload = await whiteListPage(this.core, guild);

      const { content, components, embeds, allowedMentions, files } = whiteListPagePayload;

      return await this.safeUpdate(interaction, {
        content,
        components,
        embeds,
        allowedMentions,
        files,
      });
    } else if (value === "statChannel") {
      const guild = await this.parseGuild(interaction);

      if (guild instanceof GuildParseError) {
        return { content: guild.message, flags: [MessageFlags.Ephemeral] };
      }

      const statChannelPagePayload = await statChannelPage(this.core, guild);

      const { content, components, embeds, allowedMentions, files } = statChannelPagePayload;

      return await this.safeUpdate(interaction, {
        content,
        components,
        embeds,
        allowedMentions,
        files,
      });
    }

    return {
      content: `${value}は無効な選択肢です`,
      flags: [MessageFlags.Ephemeral],
    };
  }
}
