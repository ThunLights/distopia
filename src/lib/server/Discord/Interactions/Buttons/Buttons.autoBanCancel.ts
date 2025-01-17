import { ActionRowBuilder, ModalBuilder, PermissionsBitField, TextInputBuilder, TextInputStyle } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { errorHandling } from "$lib/server/error";

import type { ButtonInteraction, CacheType, InteractionReplyOptions, MessagePayload } from "discord.js";
import { database } from "$lib/server/Database";

export class AutoBanCancelButton extends ButtonsBase {
	public readonly customId = "autoBanCancel";

	public async commands(interaction: ButtonInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		try {
			if (!(
				interaction.guild
				&& interaction.member
				&& interaction.member.permissions
				&& interaction.member.permissions instanceof PermissionsBitField
				&& interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
			)) {
				return { content: "権限がありません", ephemeral: true } satisfies InteractionReplyOptions;
			}
			const result = await database.guildTables.settings.dangerousPeople.ban.remove(interaction.guild.id);
			return { content: result ? "AutoBANが無効になりました。" : "DATABASE_ERROR", ephemeral: true } satisfies InteractionReplyOptions;
		} catch (error) {
			errorHandling(error);
			return { content: "ERROR", ephemeral: true } satisfies InteractionReplyOptions;
		}
	}
}
