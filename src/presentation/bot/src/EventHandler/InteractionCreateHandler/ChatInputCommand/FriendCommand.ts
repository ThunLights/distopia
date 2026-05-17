import { CHARACTER_LIMIT, NUM_TAG_LIMIT } from "app-core/constant";
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
import { ModalSended } from "../Base/Modal/ModalSended";

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
          .setLabel(`タグ (最大${NUM_TAG_LIMIT}個, 最大${CHARACTER_LIMIT.tag}文字, Enterで区切り)`)
          .setTextInputComponent(
            new TextInputBuilder().setCustomId("tags").setStyle(TextInputStyle.Paragraph),
          ),
      );

    await interaction.showModal(modal);

    return new ModalSended();
  }
}
