import { PermissionsBitField, MessageFlags, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { errorHandling } from "$lib/server/error";

import type { ButtonInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class BumpNoticeContentButton extends ButtonsBase {
	public readonly customId = "bumpNoticeContent";

	public async commands(interaction: ButtonInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		try {
			if (!(
				interaction.member
				&& interaction.member.permissions
				&& interaction.member.permissions instanceof PermissionsBitField
				&& interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
			)) {
				return { content: "権限がありません", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
			}

			const embed = new EmbedBuilder()
				.setColor("Navy")
				.setTitle("Bumpメッセージ設定")
				.setDescription("Bumpメッセージを設定することができます。");

			const settingsButton = new ButtonBuilder()
				.setCustomId("bumpNoticeContentSet")
				.setLabel("設定する")
				.setStyle(ButtonStyle.Success);
			const cancelButton = new ButtonBuilder()
				.setCustomId("bumpNoticeContentCancel")
				.setLabel("リセット")
				.setStyle(ButtonStyle.Danger);

			return {
				embeds: [ embed ],
				components: [ new ActionRowBuilder<ButtonBuilder>().addComponents(settingsButton, cancelButton) ],
				flags: [ MessageFlags.Ephemeral ],
			} satisfies InteractionReplyOptions;
		} catch (error) {
			errorHandling(error);
			return { content: "ERROR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		}
	}
}
