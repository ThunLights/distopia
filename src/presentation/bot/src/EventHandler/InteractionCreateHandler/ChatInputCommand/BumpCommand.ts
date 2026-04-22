import {
  EmbedBuilder,
  MessageFlags,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { LateLimitError } from "domain-model";

import { GuildParseError } from "../Base/Base";
import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";

type Options = {};

export class BumpCommand extends ChatInputCommandBase<Options> {
  public override regist: RESTPostAPIChatInputApplicationCommandsJSONBody = {
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

    if (bumped instanceof LateLimitError) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Distopia: Discordサーバー掲示板")
        .setURL(`https://distopia.top/`)
        .setDescription(
          `レートリミットです。${Math.ceil(bumped.remainTime / (60 * 1000))}分経ってから再度実行してください`,
        );
      return { embeds: [embed], flags: [MessageFlags.Ephemeral] };
    }

    const settings = await this.core.state.database.guildSetting.findUnique({
      where: { guildId: guild.id },
    });

    if (settings && settings.bumpNotice && channel?.isSendable()) {
      setTimeout(async () => {
        const { bumpNoticeContent, bumpNoticeRole } = settings;
        const embed = new EmbedBuilder()
          .setColor("Gold")
          .setTitle("Bumpが実行できますよ!!")
          .setURL(`https://distopia.top/`)
          .setDescription(
            bumpNoticeContent ??
              `只今、前回のBumpから2時間がたちました。\n再度 </bump:${interaction.commandId}> を実行可能です。`,
          );
        await channel.send({
          content: bumpNoticeRole ? `<@&${bumpNoticeRole}>` : undefined,
          embeds: [embed],
        });
      }, twoHours);
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
