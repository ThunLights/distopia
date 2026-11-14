import {
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type InteractionResponse,
  type PermissionResolvable,
  MessageFlags,
} from "discord.js";
import { ButtonInteractionBase } from "presentation-bot-kit/base/ButtonInteractionBase";
import { GuildParseError } from "presentation-bot-kit/base/Error/GuildParseError";
import type { ModalSended } from "presentation-bot-kit/base/Modal/ModalSended";

export class WebEditCancelButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "webEditCancel";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionResponse<boolean> | ModalSended
  > {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.guild.deleteDraft(guild.id);

    return await interaction.update({
      content: "サーバープロフィール設定をキャンセルしました。",
    });
  }
}
