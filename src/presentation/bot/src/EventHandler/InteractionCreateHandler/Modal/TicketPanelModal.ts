import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  InteractionResponse,
  type CacheType,
  type InteractionReplyOptions,
  type ModalSubmitInteraction,
  type PermissionResolvable,
} from "discord.js";
import z from "zod";

import { validator, type ValidateResult } from "../../../utils/validator";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";

const OptionsSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
});

type Options = z.infer<typeof OptionsSchema>;

export class TicketPanelModal extends ModalSubmitInteractionBase<Options> {
  public override requireBotChannelPermissions: PermissionResolvable[] = [
    "ViewChannel",
    "SendMessages",
    "EmbedLinks",
  ];
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "ticketPanelContent";

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator(
      {
        title: interaction.fields.getTextInputValue("title"),
        description: interaction.fields.getTextInputValue("description"),
      },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse> {
    if (!interaction.channel?.isSendable()) {
      return { content: "このチャンネルには設置できません。", flags: [MessageFlags.Ephemeral] };
    }

    await interaction.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Navy")
          .setTitle(options.title)
          .setDescription(options.description),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("ticketOpen")
            .setLabel("チケットを作成")
            .setStyle(ButtonStyle.Primary),
        ),
      ],
    });

    return { content: "パネルを設置しました。", flags: [MessageFlags.Ephemeral] };
  }
}
