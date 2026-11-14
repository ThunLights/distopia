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
import { StringSelectMenuInteractionBase } from "presentation-bot-kit/base/StringSelectMenuInteractionBase";
import { ValidateError, validator } from "presentation-bot-kit/validator";
import z from "zod";

const customIdPrefix = "blackListTargetPickManage:";

const BlackListIdSchema = z.coerce.number().int();

export class BlackListTargetPickManageSelectMenu extends StringSelectMenuInteractionBase {
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

    const [target, canEdit, canRemove] = await Promise.all([
      this.core.blackList.findTarget(blackListId, userId),
      this.core.blackList.hasPermission(blackListId, requesterId, "EditTarget"),
      this.core.blackList.hasPermission(blackListId, requesterId, "RemoveTarget"),
    ]);

    if (!target) {
      return { content: "対象が見つかりませんでした。", flags: [MessageFlags.Ephemeral] };
    }

    const embed = new EmbedBuilder()
      .setColor("Navy")
      .setTitle(target.label)
      .setDescription(`<@${target.userId}> (${target.userId})\n${target.description}`);

    const buttons: ButtonBuilder[] = [
      new ButtonBuilder()
        .setCustomId(`backBlackListTargetManageDetail:${blackListId}`)
        .setStyle(ButtonStyle.Danger)
        .setLabel("戻る"),
    ];

    if (canEdit) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`blackListTargetEditOpen:${blackListId}:${userId}`)
          .setStyle(ButtonStyle.Primary)
          .setLabel("編集"),
      );
    }

    if (canRemove) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`blackListTargetManageRemove:${blackListId}:${userId}`)
          .setStyle(ButtonStyle.Danger)
          .setLabel("削除"),
      );
    }

    return await interaction.update({
      embeds: [embed],
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)],
    });
  }
}
