import {
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type InteractionResponse,
  type MessagePayload,
  type PermissionResolvable,
  type StringSelectMenuInteraction,
} from "discord.js";
import z from "zod";

import { validator, type ValidateResult } from "../../../utils/validator";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";
import { blackListDetailPage } from "../Page/BlackListDetailPage";

const customIdPrefix = "blackListBanTags:";

const OptionsSchema = z.object({
  blackListId: z.coerce.number().int(),
  tags: z.string().array(),
});

type Options = z.infer<typeof OptionsSchema>;

export class BlackListBanTagsSelectMenu extends StringSelectMenuInteractionBase<
  typeof OptionsSchema,
  Options
> {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = customIdPrefix;

  public override async match(
    interaction: StringSelectMenuInteraction<CacheType>,
  ): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  public override async parseOptions(
    interaction: StringSelectMenuInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator(
      {
        blackListId: interaction.customId.slice(customIdPrefix.length),
        tags: interaction.values,
      },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: Options,
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.blackList.apply({
      guildId: guild.id,
      blackListId: options.blackListId,
      banTags: options.tags,
    });

    const pagePayload = await blackListDetailPage(this.core, guild, options.blackListId);
    const { content, components, embeds, allowedMentions, files } = pagePayload;

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}
