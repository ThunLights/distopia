import {
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
          .setLabel("R18にしたい場合は下記にokと入力してください")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("nsfw")
              .setValue("no")
              .setStyle(TextInputStyle.Short),
          ),
        new LabelBuilder()
          .setLabel(
            `検索タグ (最大${this.core.state.constants.NUM_TAG_LIMIT}}個, 最大${this.core.state.constants.CHARACTER_LIMIT.tag}文字, Enterで区切り)`,
          )
          .setTextInputComponent(
            new TextInputBuilder().setCustomId("tags").setStyle(TextInputStyle.Paragraph),
          ),
        new LabelBuilder()
          .setLabel("自己紹介")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("profile")
              .setStyle(TextInputStyle.Paragraph)
              .setMaxLength(this.core.state.constants.CHARACTER_LIMIT.description),
          ),
      );

    return await interaction.showModal(modal);
  }
}
