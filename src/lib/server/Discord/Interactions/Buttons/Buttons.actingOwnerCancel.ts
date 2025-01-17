import { PermissionsBitField } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { errorHandling } from "$lib/server/error";
import { database } from "$lib/server/Database/index";

import type { ButtonInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class ActingOwnerCancelButton extends ButtonsBase {
	public readonly customId = "actingOwnerCancel";

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
			const result = await database.guildTables.settings.owner.delete(interaction.guild.id);
			return { content: result ? "オーナー権限があなたに戻りました。" : "DATABASE_ERROR", ephemeral: true } satisfies InteractionReplyOptions;
		} catch (error) {
			errorHandling(error);
			return { content: "ERROR", ephemeral: true } satisfies InteractionReplyOptions;
		}
	}
}
