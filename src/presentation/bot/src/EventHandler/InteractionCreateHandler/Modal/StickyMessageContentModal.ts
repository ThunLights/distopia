import { CHARACTER_LIMIT } from "app-core/constant";
import {
  ChannelType,
  type CacheType,
  type InteractionReplyOptions,
  type ModalSubmitInteraction,
  type PermissionResolvable,
  InteractionResponse,
  MessageFlags,
} from "discord.js";
import z from "zod";

import { validator, type ValidateResult } from "../../../utils/validator";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";
import { stickyMessagePage } from "../Page/StickyMessagePage";

const OptionsSchema = z.object({
  content: z.string().min(1).max(CHARACTER_LIMIT.stickyMessage),
});

type Options = z.infer<typeof OptionsSchema>;

const customIdPrefix = "stickyMessageContent:";

export class StickyMessageContentModal extends ModalSubmitInteractionBase<Options> {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = customIdPrefix;

  public override async match(interaction: ModalSubmitInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator(
      {
        content: interaction.fields.getTextInputValue("content"),
      },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const channelId = interaction.customId.slice(customIdPrefix.length);
    // The id round-trips through a customId, so confirm it's a text channel of this guild
    // before storing anything for it.
    const channel = interaction.guild?.channels.cache.get(channelId);
    if (channel?.type !== ChannelType.GuildText) {
      return { content: "チャンネルが見つかりません。", flags: [MessageFlags.Ephemeral] };
    }

    const posted = await this.core.stickyMessage.save(guild.id, channelId, options.content);

    if (!posted) {
      return {
        content: "保存しましたが、投稿に失敗しました。ボットの権限を確認してください。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (!interaction.isFromMessage()) {
      return { content: "変更完了しました。", flags: [MessageFlags.Ephemeral] };
    }

    const { content, components, embeds, allowedMentions, files } = await stickyMessagePage(
      this.core,
      guild,
    );

    return await interaction.update({
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}
