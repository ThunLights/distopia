import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, PermissionsBitField } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { errorHandling } from "$lib/server/error";

import type { ButtonInteraction, CacheType, InteractionReplyOptions, MessagePayload } from "discord.js";

export class AutoBanButton extends ButtonsBase {
	public readonly customId = "autoBan";

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
				.setColor("DarkAqua")
				.setTitle("自動BANを設定する")
				.setDescription("以下のボタンで操作をしてください");
			const setButton = new ButtonBuilder()
				.setCustomId("autoBanSet")
				.setLabel("自動BANを設定する")
				.setStyle(ButtonStyle.Success);
			const cancelButton = new ButtonBuilder()
				.setCustomId("autoBanCancel")
				.setLabel("無効化")
				.setStyle(ButtonStyle.Danger);
			return { embeds: [ embed ], components: [ new ActionRowBuilder<ButtonBuilder>().addComponents(setButton, cancelButton) ], flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		} catch (error) {
			errorHandling(error);
			return { content: "ERROR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		}
	}
}
