import { CHARACTER_LIMIT } from "app-core/constant";
import {
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type InteractionResponse,
  MessageFlags,
  ModalBuilder,
  LabelBuilder,
  TextInputBuilder,
  TextInputStyle,
  CheckboxBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  type PermissionResolvable,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { ModalSended } from "../Base/Modal/ModalSended";

export class WebEditChangeButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "webEditChange";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionResponse<boolean> | ModalSended
  > {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const draft = await this.core.guild.getDraft(guild.id);

    const modal = new ModalBuilder()
      .setCustomId("webEdit")
      .setTitle("Web公開設定")
      .setLabelComponents(
        new LabelBuilder()
          .setLabel("招待リンク作成")
          .setChannelSelectMenuComponent(
            new ChannelSelectMenuBuilder()
              .setCustomId("invite")
              .setChannelTypes(ChannelType.GuildText),
          ),
        new LabelBuilder().setLabel("説明文").setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("description")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(draft.description ?? "")
            .setMaxLength(CHARACTER_LIMIT.description),
        ),
        new LabelBuilder()
          .setLabel("NSFW")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("nsfw").setDefault(draft.nsfw ?? false),
          ),
        new LabelBuilder()
          .setLabel("公開")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("pub").setDefault(draft.pub ?? true),
          ),
        new LabelBuilder().setLabel("タグ1").setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("tag1")
            .setValue((draft.tag ?? [])[0] ?? "")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(CHARACTER_LIMIT.tag),
        ),
        new LabelBuilder().setLabel("タグ2").setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("tag2")
            .setValue((draft.tag ?? [])[1] ?? "")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(CHARACTER_LIMIT.tag),
        ),
        new LabelBuilder().setLabel("タグ3").setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("tag3")
            .setValue((draft.tag ?? [])[2] ?? "")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(CHARACTER_LIMIT.tag),
        ),
        new LabelBuilder().setLabel("タグ4").setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("tag4")
            .setValue((draft.tag ?? [])[3] ?? "")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(CHARACTER_LIMIT.tag),
        ),
        new LabelBuilder().setLabel("タグ5").setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("tag5")
            .setValue((draft.tag ?? [])[4] ?? "")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(CHARACTER_LIMIT.tag),
        ),
      );

    await interaction.showModal(modal);

    return new ModalSended();
  }
}
