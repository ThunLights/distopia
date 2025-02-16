import { PermissionsBitField, MessageFlags } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { errorHandling } from "$lib/server/error";

import type { ButtonInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";
import { database } from "$lib/server/Database";

export class BumpNoticeContentCancelButton extends ButtonsBase {
	public readonly customId = "bumpNoiceContentCancel";

	public async commands(interaction: ButtonInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		try {
			if (!(
				interaction.guildId
				&& interaction.member
				&& interaction.member.permissions
				&& interaction.member.permissions instanceof PermissionsBitField
				&& interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
			)) {
				return { content: "権限がありません", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
			}

			const result = await database.guildTables.settings.bumpNoticeContent.remove(interaction.guildId);
			if (!result) {
				return { content: "DATABASE_ERROR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
			}

			return { content: "リセットしました。", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		} catch (error) {
			errorHandling(error);
			return { content: "ERROR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		}
	}
}
