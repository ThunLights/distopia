import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { errorHandling } from "$lib/server/error";

import type { ButtonInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class BumpNoticeButton extends ButtonsBase {
	public readonly customId = "bumpNotice";

	public async commands(interaction: ButtonInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		try {
			if (!(
				interaction.member
				&& interaction.member.permissions
				&& interaction.member.permissions instanceof PermissionsBitField
				&& interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
			)) {
				return { content: "権限がありません", ephemeral: true } satisfies InteractionReplyOptions;
			}

			const embed = new EmbedBuilder()
				.setColor("Navy")
				.setTitle("Bump通知")
				.setDescription("ONにするとbumpコマンドが再実行可能になると通知します。");

			const onButton = new ButtonBuilder()
				.setCustomId("bumpNoticeOn")
				.setLabel("ON")
				.setStyle(ButtonStyle.Success);
			const offButton = new ButtonBuilder()
				.setCustomId("bumpNoticeOff")
				.setLabel("OFF")
				.setStyle(ButtonStyle.Danger);

			return void await interaction.reply({
				embeds: [ embed ],
				components: [ new ActionRowBuilder<ButtonBuilder>().addComponents(onButton, offButton) ],
				ephemeral: true,
			})
		} catch (error) {
			errorHandling(error);
			return { content: "ERROR", ephemeral: true } satisfies InteractionReplyOptions;
		}
	}
}
