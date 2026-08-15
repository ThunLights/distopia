import { CHARACTER_LIMIT, NUM_TAG_LIMIT } from "app-core/constant";
import {
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type InteractionResponse,
  MessageFlags,
  ModalBuilder,
  LabelBuilder,
  TextInputBuilder,
  TextInputStyle,
  CheckboxBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  type PermissionResolvable,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { ModalSended } from "../Base/Modal/ModalSended";

export class WebEditChangeButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "webEditChange";

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

    let inviteChannelId: string | undefined;

    if (draft.invite) {
      try {
        // Discord requires the modal to be shown within 3 seconds of the interaction,
        // so this lookup must not be allowed to run as long as the REST client's own timeout.
        const invite = await Promise.race([
          interaction.client.fetchInvite(draft.invite),
          new Promise<never>((_resolve, reject) =>
            setTimeout(() => reject(new Error("invite fetch timed out")), 1500),
          ),
        ]);
        inviteChannelId = invite.channelId ?? undefined;
      } catch {
        inviteChannelId = undefined;
      }
    }

    const inviteChannelSelectMenu = new ChannelSelectMenuBuilder()
      .setCustomId("invite")
      .setChannelTypes(ChannelType.GuildText);

    if (inviteChannelId) {
      inviteChannelSelectMenu.setDefaultChannels(inviteChannelId);
    }

    const modal = new ModalBuilder()
      .setCustomId("webEdit")
      .setTitle("Web公開設定")
      .setLabelComponents(
        new LabelBuilder()
          .setLabel("招待リンク作成")
          .setChannelSelectMenuComponent(inviteChannelSelectMenu),
        new LabelBuilder().setLabel("説明文").setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("description")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(draft.description ?? "")
            .setMaxLength(CHARACTER_LIMIT.description),
        ),
        new LabelBuilder()
          .setLabel("NSFW")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("nsfw").setDefault(draft.nsfw ?? false),
          ),
        new LabelBuilder()
          .setLabel("公開")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("pub").setDefault(draft.pub ?? true),
          ),
        new LabelBuilder()
          .setLabel(`タグ (最大${NUM_TAG_LIMIT}個, 最大${CHARACTER_LIMIT.tag}文字, Enterで区切り)`)
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("tags")
              .setValue((draft.tag ?? []).join("\n"))
              .setStyle(TextInputStyle.Paragraph),
          ),
      );

    await interaction.showModal(modal);

    return new ModalSended();
  }
}
