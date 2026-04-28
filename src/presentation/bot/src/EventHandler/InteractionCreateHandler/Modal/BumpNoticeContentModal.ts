import {
  type ModalSubmitInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type PermissionResolvable,
  MessageFlags,
  InteractionResponse,
} from "discord.js";

import { GuildParseError } from "../Base/Error/GuildParseError";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";
import { page } from "../Page/Settings";

type Options = {
  content: string;
};

export class BumpNoticeContentModal extends ModalSubmitInteractionBase<Options> {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "bumpNoticeContent";

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<Options> {
    return {
      content: interaction.fields.getTextInputValue("content"),
    };
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.guild.saveSetting({ guildId: guild.id, bumpNoticeContent: options.content });

    const settingPage = await page(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = settingPage;

    if (interaction.isFromMessage()) {
      const res = await interaction.update({
        content,
        components,
        embeds,
        allowedMentions,
        files,
      });
      return res;
    } else {
      return {
        content: "元のメッセージが削除されたため元のページに戻れませんでした",
        flags: [MessageFlags.Ephemeral],
      };
    }
  }
}
