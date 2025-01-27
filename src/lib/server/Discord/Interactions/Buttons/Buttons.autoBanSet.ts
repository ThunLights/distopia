import { ActionRowBuilder, MessageFlags, ModalBuilder, PermissionsBitField, TextInputBuilder, TextInputStyle } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { errorHandling } from "$lib/server/error";

import type { ButtonInteraction, CacheType, InteractionReplyOptions, MessagePayload } from "discord.js";

export class AutoBanSetButton extends ButtonsBase {
	public readonly customId = "autoBanSet";

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
						.setLabel("以下のスコア以上のユーザーをBANします。")
						.setCustomId("content")
						.setValue("50")
						.setStyle(TextInputStyle.Short)
						.setMaxLength(5)
				)

			const modal = new ModalBuilder()
				.setCustomId("autoBan")
				.setTitle("Auto Ban設定")
				.setComponents(contentInput);

			return void await interaction.showModal(modal);
		} catch (error) {
			errorHandling(error);
			return { content: "ERROR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		}
	}
}
