import { CHARACTER_LIMIT } from "app-core/constant";
import {
  InteractionResponse,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { ModalSended } from "../Base/Modal/ModalSended";

const customIdPrefix = "stickyMessageContentSubmit:";

export class StickyMessageContentSubmitButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = customIdPrefix;

  public override async match(interaction: ButtonInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionResponse | ModalSended
  > {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const channelId = interaction.customId.slice(customIdPrefix.length);
    const sticky = await this.core.stickyMessage.find(guild.id, channelId);

    const textInput = new TextInputBuilder()
      .setCustomId("content")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(CHARACTER_LIMIT.stickyMessage)
      .setRequired(true);

    if (sticky) {
      textInput.setValue(sticky.content);
    }

    const modal = new ModalBuilder()
      .setCustomId(`stickyMessageContent:${channelId}`)
      .setTitle("ピン止めメッセージ設定")
      .addLabelComponents(new LabelBuilder().setLabel("内容").setTextInputComponent(textInput));

    await interaction.showModal(modal);

    return new ModalSended();
  }
}
