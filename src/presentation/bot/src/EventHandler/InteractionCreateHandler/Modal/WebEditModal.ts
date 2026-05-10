import { isBlankSync } from "app-core/blank";
import { CHARACTER_LIMIT, NUM_TAG_LIMIT } from "app-core/constant";
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
  tags: string[];
};

export class WebEditModal extends ModalSubmitInteractionBase<Options> {
  public override requireBotGuildPermissions: PermissionResolvable[] = ["CreateInstantInvite"];
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "webEdit";

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<Options> {
    const tags = interaction.fields
      .getTextInputValue("tags")
      .split("\n")
      .filter((value) => !isBlankSync(value));

    return {
      description: interaction.fields.getTextInputValue("description"),
      nsfw: interaction.fields.getCheckbox("nsfw"),
      pub: interaction.fields.getCheckbox("pub"),
      invite: interaction.fields
        .getSelectedChannels("invite", true, [ChannelType.GuildText])
        .values()
        .toArray()[0],
      tags,
    };
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse<boolean>> {
    const { description, nsfw, pub, invite, tags } = options;
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

    if (tags.length > NUM_TAG_LIMIT) {
      return { content: `タグは${NUM_TAG_LIMIT}つまでです`, flags: [MessageFlags.Ephemeral] };
    }

    for (const tag of tags) {
      if (tag.length > CHARACTER_LIMIT.tag) {
        return {
          content: `タグの文字数は${CHARACTER_LIMIT.tag}文字までです`,
          flags: [MessageFlags.Ephemeral],
        };
      }
    }

    const channel = interaction.guild?.channels.cache.get(invite.id);

    if (!channel || channel.type !== ChannelType.GuildText) {
      return { content: `チャンネルが見つかりませんでした。`, flags: [MessageFlags.Ephemeral] };
    }

    const { code } = await channel.createInvite({
      maxAge: 0,
      maxUses: 0,
    });

    await this.core.guild.saveDraft(guild.id, {
      description,
      nsfw,
      pub,
      invite: code,
      tags,
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
        content: "変更完了しました。",
        flags: [MessageFlags.Ephemeral],
      };
    }
  }
}
