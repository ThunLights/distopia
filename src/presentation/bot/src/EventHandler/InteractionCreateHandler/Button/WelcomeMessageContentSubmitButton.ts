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

import { WelcomeMessenger } from "../../../utils/welcome/WelcomeMessenger";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { ModalSended } from "../Base/Modal/ModalSended";

const customIdPrefix = "welcomeMessageContentSubmit:";

export class WelcomeMessageContentSubmitButton extends ButtonInteractionBase {
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

    const field = interaction.customId.slice(customIdPrefix.length);

    if (!WelcomeMessenger.isField(field)) {
      return { content: `${field}は無効な選択肢です`, flags: [MessageFlags.Ephemeral] };
    }

    const label = WelcomeMessenger.labels[field];
    const settings = await this.core.guild.getSetting(guild.id);
    const currentContent = settings?.[label.contentField];

    const textInput = new TextInputBuilder()
      .setCustomId("content")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(CHARACTER_LIMIT.description)
      .setPlaceholder("{user}/{username}/{server}/{membercount} が使えます")
      .setRequired(true);

    if (currentContent) {
      textInput.setValue(currentContent);
    }

    const modal = new ModalBuilder()
      .setCustomId(`welcomeMessageContent:${field}`)
      .setTitle(label.title)
      .addLabelComponents(new LabelBuilder().setLabel("内容").setTextInputComponent(textInput));

    await interaction.showModal(modal);

    return new ModalSended();
  }
}
