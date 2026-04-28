import { useAsync } from "app-core/async";
import { isBlankSync } from "app-core/blank";
import {
  type ModalSubmitInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type InteractionResponse,
  MessageFlags,
  ChannelType,
  TextChannel,
  type PermissionResolvable,
} from "discord.js";

import { GuildParseError } from "../Base/Error/GuildParseError";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";
import { page } from "../Page/WebEdit";

type Options = {
  description: string;
  nsfw: boolean;
  pub: boolean;
  invite: TextChannel | undefined;
  tag1: string;
  tag2: string;
  tag3: string;
  tag4: string;
  tag5: string;
};

export class WebEditModal extends ModalSubmitInteractionBase<Options> {
  public override requireBotGuildPermissions: PermissionResolvable[] = ["CreateInstantInvite"];
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "webEdit";

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<Options> {
    return {
      description: interaction.fields.getTextInputValue("description"),
      nsfw: interaction.fields.getCheckbox("nsfw"),
      pub: interaction.fields.getCheckbox("pub"),
      invite: interaction.fields
        .getSelectedChannels("invite", true, [ChannelType.GuildText])
        .values()
        .toArray()[0],
      tag1: interaction.fields.getTextInputValue("tag1"),
      tag2: interaction.fields.getTextInputValue("tag2"),
      tag3: interaction.fields.getTextInputValue("tag3"),
      tag4: interaction.fields.getTextInputValue("tag4"),
      tag5: interaction.fields.getTextInputValue("tag5"),
    };
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse<boolean>> {
    const { description, nsfw, pub, invite, tag1, tag2, tag3, tag4, tag5 } = options;
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    if (!invite) {
      return {
        content: "招待リンク作成用のチャンネルを選択してください。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    const channel = interaction.guild?.channels.cache.get(invite.id);

    if (!channel || channel.type !== ChannelType.GuildText) {
      return { content: `チャンネルが見つかりませんでした。`, flags: [MessageFlags.Ephemeral] };
    }

    const { code } = await channel.createInvite({
      maxAge: 0,
      maxUses: 0,
    });

    await useAsync(this.core.state.memory.guildEdit.set)(guild.id, {
      description,
      nsfw,
      pub,
      invite: code,
      tags: [tag1, tag2, tag3, tag4, tag5].filter((value) => !isBlankSync(value)),
      updated: new Date(),
    });

    if (interaction.isFromMessage()) {
      const { content, components, embeds, allowedMentions, files } = await page(this.core, guild);

      return await interaction.update({
        content,
        components,
        embeds,
        allowedMentions,
        files,
      });
    } else {
      return {
        content: "元のメッセージが消されています。",
        flags: [MessageFlags.Ephemeral],
      };
    }
  }
}
