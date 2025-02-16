import { PermissionsBitField, MessageFlags, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, TextInputBuilder, TextInputStyle, ModalBuilder } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { errorHandling } from "$lib/server/error";

import type { ButtonInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class BumpNoticeContentSetButton extends ButtonsBase {
	public readonly customId = "bumpNoiceContentSet";

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
			const contentInput = new ActionRowBuilder<TextInputBuilder>()
				.addComponents(
					new TextInputBuilder()
						.setLabel("メッセージ内容")
						.setCustomId("content")
						.setStyle(TextInputStyle.Paragraph)
						.setMaxLength(100)
				)

			const modal = new ModalBuilder()
				.setCustomId("bumpNoticeContent")
				.setTitle("Bumpメッセージ設定")
				.setComponents(contentInput);

			return void await interaction.showModal(modal);
		} catch (error) {
			errorHandling(error);
			return { content: "ERROR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		}
	}
}
