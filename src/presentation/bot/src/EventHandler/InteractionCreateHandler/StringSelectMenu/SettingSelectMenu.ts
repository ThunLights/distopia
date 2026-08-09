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
  InteractionResponse,
} from "discord.js";

import { GuildParseError } from "../Base/Error/GuildParseError";
import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";
import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";
import { antiRaidPage } from "../Page/AntiRaidPage";
import { bumpPage } from "../Page/BumpPage";
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

      return await interaction.update({
        embeds: [embed],
        components: [
          new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelector),
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            await backSettingsPageButton(),
            resetButton,
          ),
        ],
      });
    } else if (value === "bump") {
      const guild = await this.parseGuild(interaction);

      if (guild instanceof GuildParseError) {
        return { content: guild.message, flags: [MessageFlags.Ephemeral] };
      }

      const bumpPagePayload = await bumpPage(this.core, guild);

      const { content, components, embeds, allowedMentions, files } = bumpPagePayload;

      return await interaction.update({
        content,
        components,
        embeds,
        allowedMentions,
        files,
      });
    } else if (value === "antiRaid") {
      const guild = await this.parseGuild(interaction);

      if (guild instanceof GuildParseError) {
        return { content: guild.message, flags: [MessageFlags.Ephemeral] };
      }

      const antiRaidPagePayload = await antiRaidPage(this.core, guild);

      const { content, components, embeds, allowedMentions, files } = antiRaidPagePayload;

      return await interaction.update({
        content,
        components,
        embeds,
        allowedMentions,
        files,
      });
    } else if (value === "whiteList") {
      const guild = await this.parseGuild(interaction);

      if (guild instanceof GuildParseError) {
        return { content: guild.message, flags: [MessageFlags.Ephemeral] };
      }

      const whiteListPagePayload = await whiteListPage(this.core, guild);

      const { content, components, embeds, allowedMentions, files } = whiteListPagePayload;

      return await interaction.update({
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

      return await interaction.update({
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
