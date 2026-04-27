import { isBlankSync } from "app-core/blank";
import { CHARACTER_LIMIT, NUM_TAG_LIMIT } from "app-core/constant";
import {
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type Message,
  type ModalSubmitInteraction,
  type OmitPartialGroupDMChannel,
  type PermissionResolvable,
} from "discord.js";

import { GuildParseError } from "../Base/Base";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";
import { page } from "../Page/Settings";

type Options = {
  nsfw: boolean;
  tags: string[];
  profile: string;
};

export class FriendModal extends ModalSubmitInteractionBase<Options> {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "friend";

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<Options> {
    return {
      nsfw: interaction.fields.getTextInputValue("nsfw") === "yes",
      tags: interaction.fields
        .getTextInputValue("tags")
        .split("\n")
        .filter((value) => !isBlankSync(value)),
      profile: interaction.fields.getTextInputValue("profile"),
    };
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | OmitPartialGroupDMChannel<Message<boolean>>> {
    const user = await this.parseUser(interaction);
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    if (options.tags.length > NUM_TAG_LIMIT) {
      return { content: `タグは${NUM_TAG_LIMIT}つまでです`, flags: [MessageFlags.Ephemeral] };
    }

    for (const tag of options.tags) {
      if (tag.length > CHARACTER_LIMIT.tag) {
        return {
          content: `タグの文字数は${CHARACTER_LIMIT.tag}文字までです`,
          flags: [MessageFlags.Ephemeral],
        };
      }
    }

    await this.core.friend.save({
      userId: user.id,
      username: user.name,
      description: options.profile,
      nsfw: options.nsfw,
      updatedAt: new Date(),
      tags: options.tags,
    });

    const settingPage = await page(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = settingPage;

    return (
      (await interaction.message?.edit({
        content,
        components,
        embeds,
        allowedMentions,
        files,
      })) ?? {
        content: "元のメッセージが削除されたため元のページに戻れませんでした",
        flags: [MessageFlags.Ephemeral],
      }
    );
  }
}
