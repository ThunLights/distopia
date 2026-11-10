import { features } from "app-feature-loader/bot";
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
import { GuildParseError } from "presentation-bot-kit/base/Error/GuildParseError";
import { StringSelectMenuInteractionBase } from "presentation-bot-kit/base/StringSelectMenuInteractionBase";
import { backSettingsPageButton } from "presentation-bot-kit/component/BackSettingsPageButton";

import { antiRaidPage } from "../Page/AntiRaidPage";
import { blackListPage } from "../Page/BlackListPage";
import { bumpPage } from "../Page/BumpPage";
import { logPage } from "../Page/LogPage";
import { stickyMessagePage } from "../Page/StickyMessagePage";
import { ticketPage } from "../Page/TicketPage";
import { welcomeMessagePage } from "../Page/WelcomeMessagePage";
import { whiteListPage } from "../Page/WhiteListPage";

export class SettingSelectMenu extends StringSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "setting";

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: { value: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const { value } = options;

    const featureSetting = features
      .flatMap((f) => f.settings ?? [])
      .find((setting) => setting.value === value);

    if (featureSetting) {
      const guild = await this.parseGuild(interaction);

      if (guild instanceof GuildParseError) {
        return { content: guild.message, flags: [MessageFlags.Ephemeral] };
      }

      const { content, components, embeds, allowedMentions, files } = await featureSetting.page(
        this.core,
        guild,
      );

      return await interaction.update({ content, components, embeds, allowedMentions, files });
    }

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
    } else if (value === "welcomeMessage") {
      const guild = await this.parseGuild(interaction);

      if (guild instanceof GuildParseError) {
        return { content: guild.message, flags: [MessageFlags.Ephemeral] };
      }

      const welcomeMessagePagePayload = await welcomeMessagePage(this.core, guild);

      const { content, components, embeds, allowedMentions, files } = welcomeMessagePagePayload;

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
    } else if (value === "log") {
      const guild = await this.parseGuild(interaction);

      if (guild instanceof GuildParseError) {
        return { content: guild.message, flags: [MessageFlags.Ephemeral] };
      }

      const logPagePayload = await logPage(this.core, guild);

      const { content, components, embeds, allowedMentions, files } = logPagePayload;

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
    } else if (value === "blackList") {
      const guild = await this.parseGuild(interaction);

      if (guild instanceof GuildParseError) {
        return { content: guild.message, flags: [MessageFlags.Ephemeral] };
      }

      const blackListPagePayload = await blackListPage(this.core, guild);

      const { content, components, embeds, allowedMentions, files } = blackListPagePayload;

      return await interaction.update({
        content,
        components,
        embeds,
        allowedMentions,
        files,
      });
    } else if (value === "stickyMessage") {
      const guild = await this.parseGuild(interaction);

      if (guild instanceof GuildParseError) {
        return { content: guild.message, flags: [MessageFlags.Ephemeral] };
      }

      const { content, components, embeds, allowedMentions, files } = await stickyMessagePage(
        this.core,
        guild,
      );

      return await interaction.update({
        content,
        components,
        embeds,
        allowedMentions,
        files,
      });
    } else if (value === "ticket") {
      const guild = await this.parseGuild(interaction);

      if (guild instanceof GuildParseError) {
        return { content: guild.message, flags: [MessageFlags.Ephemeral] };
      }

      const { content, components, embeds, allowedMentions, files } = await ticketPage(
        this.core,
        guild,
      );

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
