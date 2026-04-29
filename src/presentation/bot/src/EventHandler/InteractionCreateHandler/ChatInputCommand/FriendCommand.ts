import { CHARACTER_LIMIT } from "app-core/constant";
import {
  CheckboxBuilder,
  InteractionCallbackResponse,
  LabelBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";

type Options = {};

export class FriendCommand extends ChatInputCommandBase<Options> {
  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "friend",
    description: "フレンド募集用のコマンドです。",
  };

  public override async parseOptions(
    _interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<Options> {
    return {};
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    _options: Options,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionCallbackResponse<boolean>
  > {
    const modal = new ModalBuilder()
      .setCustomId("friend")
      .setTitle("フレンド募集 (ウェブサイトに表示されます。)")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("NSFW")
          .setCheckboxComponent(new CheckboxBuilder().setCustomId("nsfw").setDefault(false)),
        new LabelBuilder()
          .setLabel("自己紹介")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("profile")
              .setStyle(TextInputStyle.Paragraph)
              .setMaxLength(CHARACTER_LIMIT.description),
          ),
        new LabelBuilder()
          .setLabel("タグ1")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("tag1")
              .setStyle(TextInputStyle.Short)
              .setMaxLength(CHARACTER_LIMIT.tag),
          ),
        new LabelBuilder()
          .setLabel("タグ2")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("tag2")
              .setStyle(TextInputStyle.Short)
              .setMaxLength(CHARACTER_LIMIT.tag),
          ),
        new LabelBuilder()
          .setLabel("タグ3")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("tag3")
              .setStyle(TextInputStyle.Short)
              .setMaxLength(CHARACTER_LIMIT.tag),
          ),
        new LabelBuilder()
          .setLabel("タグ4")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("tag4")
              .setStyle(TextInputStyle.Short)
              .setMaxLength(CHARACTER_LIMIT.tag),
          ),
        new LabelBuilder()
          .setLabel("タグ5")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("tag5")
              .setStyle(TextInputStyle.Short)
              .setMaxLength(CHARACTER_LIMIT.tag),
          ),
      );

    return await interaction.showModal(modal);
  }
}
