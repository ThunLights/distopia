import { CHARACTER_LIMIT } from "app-core/constant";
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  InteractionCallbackResponse,
  LabelBuilder,
  MessageFlags,
  MessagePayload,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
  type CacheType,
  type InteractionReplyOptions,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { ModalSended } from "../Base/Modal/ModalSended";

type Options = {
  subCommand: string;
};

export class ReviewCommand extends ChatInputCommandBase<Options> {
  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "review",
    description: "review",
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "submit",
        description: "レビューの投稿又は更新が可能です。(参加後90日必須)",
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "delete",
        description: "レビューの削除が可能です。",
      },
    ],
  };

  public override async parseOptions(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<Options> {
    return {
      subCommand: interaction.options.getSubcommand(true),
    };
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    options: Options,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionCallbackResponse<boolean>
  > {
    const { subCommand } = options;

    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const dbGuild = await this.core.guild.find(guild.id);

    if (!dbGuild) {
      return {
        content: "サーバー登録がされていません",
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "submit") {
      const modal = new ModalBuilder()
        .setCustomId("review")
        .setTitle("レビューを書く")
        .setLabelComponents(
          new LabelBuilder()
            .setLabel("スター")
            .setStringSelectMenuComponent(
              new StringSelectMenuBuilder()
                .setCustomId("star")
                .setPlaceholder("星の数を選択")
                .setOptions(
                  new StringSelectMenuOptionBuilder().setLabel("1").setValue("1"),
                  new StringSelectMenuOptionBuilder().setLabel("2").setValue("2"),
                  new StringSelectMenuOptionBuilder().setLabel("3").setValue("3"),
                  new StringSelectMenuOptionBuilder().setLabel("4").setValue("4"),
                  new StringSelectMenuOptionBuilder().setLabel("5").setValue("5"),
                ),
            ),
          new LabelBuilder()
            .setLabel("内容")
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId("content")
                .setRequired(false)
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(CHARACTER_LIMIT.review),
            ),
        );

      await interaction.showModal(modal);

      return new ModalSended();
    } else if (subCommand === "delete") {
      await this.core.guild.deleteReview(dbGuild.guildId, interaction.user.id);
      return {
        content: "削除しました。",
        flags: [MessageFlags.Ephemeral],
      };
    } else {
      return {
        content: `${subCommand}は見つかりませんでした。`,
        flags: [MessageFlags.Ephemeral],
      };
    }
  }
}
