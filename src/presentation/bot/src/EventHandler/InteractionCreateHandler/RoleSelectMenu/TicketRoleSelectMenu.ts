import {
  type RoleSelectMenuInteraction,
  type CacheType,
  type MessagePayload,
  type InteractionReplyOptions,
  MessageFlags,
  type PermissionResolvable,
  InteractionResponse,
} from "discord.js";
import z from "zod";

import { validator, type ValidateResult } from "../../../utils/validator";
import { GuildParseError } from "../Base/Error/GuildParseError";
import {
  RoleSelectMenuInteractionBase,
  type OptionsSchema as BaseOptionsSchema,
} from "../Base/RoleSelectMenuInteractionBase";
import { ticketPage } from "../Page/TicketPage";

const OptionsSchema = z.object({
  roleIds: z.array(z.string().regex(/^\d+$/)).max(25),
});

type Options = z.infer<typeof OptionsSchema>;

export class TicketRoleSelectMenu extends RoleSelectMenuInteractionBase<
  typeof BaseOptionsSchema,
  Options
> {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "ticketRole";

  public override async parseOptions(
    interaction: RoleSelectMenuInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator({ roleIds: interaction.values }, OptionsSchema);
  }

  protected override async exec(
    interaction: RoleSelectMenuInteraction<CacheType>,
    options: Options,
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.guild.saveSetting({
      guildId: guild.id,
      ticketRoles: options.roleIds,
    });

    const settingPage = await ticketPage(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = settingPage;

    return await interaction.update({
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}
