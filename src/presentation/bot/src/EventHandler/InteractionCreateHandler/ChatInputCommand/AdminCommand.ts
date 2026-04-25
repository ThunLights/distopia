import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  MessagePayload,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";

type Options = {
  subCommand: string;
};

export class AdminCommand extends ChatInputCommandBase<Options> {
  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "admin",
    description: "only admin",
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "ranking",
        description: "ランキングパネルを置く",
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "status",
        description: "ステータスパネルを閲覧",
      },
    ],
  };

  public override async parseOptions(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<Options> {
    const subCommand = interaction.options.getSubcommand(true);
    return { subCommand };
  }

  public override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    options: Options,
  ): Promise<string | InteractionReplyOptions | MessagePayload> {
    const { subCommand } = options;

    if (interaction.user.id !== this.core.state.owner.id) {
      return { content: "権限がありません", flags: [MessageFlags.Ephemeral] };
    }

    if (subCommand === "ranking") {
      const embed = new EmbedBuilder()
        .setTitle("ランキングパネルを設置します")
        .setDescription("何を設置するか選んでください")
        .setColor("Gold");

      // It's not grammatically correct, but I went with this customId because it's easier to read.
      const levelButton = new ButtonBuilder()
        .setCustomId("PanelRankingLevel")
        .setLabel("レベル")
        .setStyle(ButtonStyle.Primary);
      const rateButton = new ButtonBuilder()
        .setCustomId("PanelRankingRate")
        .setLabel("アクティブレート")
        .setStyle(ButtonStyle.Primary);
      const userBumpButton = new ButtonBuilder()
        .setCustomId("PanelRankingUserBump")
        .setLabel("ユーザーBump")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        levelButton,
        rateButton,
        userBumpButton,
      );

      return { embeds: [embed], components: [row] };
    } else if (subCommand === "status") {
      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("ステータス")
        .setDescription(`ping: ${interaction.client.ws.ping}`);
      return {
        embeds: [embed],
        flags: [MessageFlags.Ephemeral],
      } satisfies InteractionReplyOptions;
    } else {
      return { content: "コマンドが見つかりませんでした", flags: [MessageFlags.Ephemeral] };
    }
  }
}
