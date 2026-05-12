import {
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type InteractionResponse,
  MessageFlags,
  type PermissionResolvable,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import type { ModalSended } from "../Base/Modal/ModalSended";
import { page } from "../Page/WebEdit";

export class WebEditSubmitButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "webEditSubmit";

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
    const { description, nsfw, pub, tag, invite } = draft;

    if (!invite) {
      return { content: "チャンネルが見つかりませんでした。", flags: [MessageFlags.Ephemeral] };
    }

    if ([description, nsfw, pub, invite].includes(undefined)) {
      return {
        content: "タグ以外の全ての項目を記入してください",
        flags: [MessageFlags.Ephemeral],
      };
    }

    await this.core.guild.save({
      guildId: guild.id,
      name: guild.name,
      icon: guild.icon,
      banner: guild.banner,
      invite,
      description,
      public: pub,
      nsfw,
      tags: tag ?? [],
    });
    await this.core.guild.deleteDraft(guild.id);

    const { content, components, embeds, allowedMentions, files } = await page(this.core, guild);

    return await interaction.update({
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}
