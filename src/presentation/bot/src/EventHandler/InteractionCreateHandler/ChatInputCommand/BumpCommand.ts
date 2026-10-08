import {
  EmbedBuilder,
  MessageFlags,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { RateLimitError } from "domain-model";

import { scheduleBumpNotice } from "../../../utils/bump/notice";
import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

type Options = {};

export class BumpCommand extends ChatInputCommandBase<Options> {
  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "bump",
    description: "サーバーの表示順を上げる",
  };

  public override async parseOptions(
    _interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<Options> {
    return {};
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    _options: Options,
  ): Promise<string | InteractionReplyOptions | MessagePayload> {
    const twoHours = 2 * 60 * 60 * 1000;
    const { channel } = interaction;
    const guild = await this.parseGuild(interaction);
    const user = await this.parseUser(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const bumped = await this.core.guild.bump(user, guild);

    if (bumped instanceof RateLimitError) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Distopia: Discordサーバー掲示板")
        .setURL(`https://distopia.top/`)
        .setDescription(
          `レートリミットです。${Math.ceil((bumped.limit.getTime() - Date.now()) / (60 * 1000))}分経ってから再度実行してください`,
        );
      return { embeds: [embed], flags: [MessageFlags.Ephemeral] };
    }

    if (!bumped) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Distopia: Discordサーバー掲示板")
        .setURL(`https://distopia.top/`)
        .setDescription("Bumpは公開サーバーでのみ実行可能です。");
      return { embeds: [embed], flags: [MessageFlags.Ephemeral] };
    }

    const settings = await this.core.guild.getSetting(guild.id);

    if (settings && settings.bumpNotice && channel?.isSendable()) {
      const job = {
        guildId: guild.id,
        channelId: channel.id,
        content: settings.bumpNoticeContent,
        roleId: settings.bumpNoticeRole,
        commandId: interaction.commandId,
        fireAt: new Date(Date.now() + twoHours).toISOString(),
      };
      // Persisted so a rolling update's restart (which kills the setTimeout below) can
      // re-arm this from Redis instead of losing the notice -- see utils/bump/notice.ts.
      await this.core.guild.saveBumpNotice(job);
      scheduleBumpNotice(job, interaction.client, this.core);
    }

    const { guildBumpCounter, userBumpCounter } = bumped;

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setTitle("Distopia: Discordサーバー掲示板")
      .setURL(`https://distopia.top/`)
      .setDescription(
        `合計Bump: ${guildBumpCounter}回\n表示順を上げました。[こちら](https://distopia.top/)で確認できます。`,
      )
      .setFields({
        name: `${interaction.user.displayName} 's Bump Score`,
        value: `合計: ${userBumpCounter}回`,
        inline: false,
      });

    return { embeds: [embed] };
  }
}
