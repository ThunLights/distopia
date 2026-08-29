import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type InteractionResponse,
  type MessagePayload,
  type StringSelectMenuInteraction,
} from "discord.js";
import z from "zod";

import { blackListEditorPermissionSummary } from "../../../utils/lists/blackList";
import { ValidateError, validator } from "../../../utils/validator";
import { PermissionError } from "../Base/Error/PermissionError";
import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";

const customIdPrefix = "blackListTargetPickEditor:";

const BlackListIdSchema = z.coerce.number().int();

export class BlackListTargetPickEditorSelectMenu extends StringSelectMenuInteractionBase {
  public override customId: string = customIdPrefix;

  public override async match(
    interaction: StringSelectMenuInteraction<CacheType>,
  ): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: { value: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const blackListId = await validator(
      interaction.customId.slice(customIdPrefix.length),
      BlackListIdSchema,
    );

    if (blackListId instanceof ValidateError) {
      return blackListId.content;
    }

    const userId = options.value;
    const requesterId = interaction.user.id;

    const permission = await this.checkBlackListOwnerPermission(blackListId, requesterId);

    if (permission instanceof PermissionError) {
      return { content: permission.message, flags: [MessageFlags.Ephemeral] };
    }

    const editor = await this.core.blackList.findEditor(blackListId, userId);

    if (!editor) {
      return { content: "編集者が見つかりませんでした。", flags: [MessageFlags.Ephemeral] };
    }

    const embed = new EmbedBuilder()
      .setColor("Navy")
      .setTitle(`編集者: ${userId}`)
      .setDescription(
        `<@${userId}> (${userId})\n権限: ${blackListEditorPermissionSummary(editor)}`,
      );

    const buttons = [
      new ButtonBuilder()
        .setCustomId(`backBlackListTargetManageEditors:${blackListId}`)
        .setStyle(ButtonStyle.Danger)
        .setLabel("戻る"),
      new ButtonBuilder()
        .setCustomId(`blackListEditorPermissionOpen:${blackListId}:${userId}`)
        .setStyle(ButtonStyle.Primary)
        .setLabel("権限を編集"),
      new ButtonBuilder()
        .setCustomId(`blackListEditorRemove:${blackListId}:${userId}`)
        .setStyle(ButtonStyle.Danger)
        .setLabel("削除"),
    ];

    return await interaction.update({
      embeds: [embed],
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)],
    });
  }
}
