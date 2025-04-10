import { MessageFlags, PermissionsBitField } from "discord.js";

import { RolesBase, RolesError } from "./Role.base";

import type {
	RoleSelectMenuInteraction,
	CacheType,
	MessagePayload,
	InteractionReplyOptions
} from "discord.js";
import { database } from "$lib/server/Database";

export class BumpRole extends RolesBase {
	public readonly customId = "bumpRole";

	public async commands(
		interaction: RoleSelectMenuInteraction<CacheType>
	): Promise<void | string | MessagePayload | InteractionReplyOptions | RolesError | null> {
		if (
			!(
				interaction.guild &&
				interaction.member &&
				interaction.member.permissions &&
				interaction.member.permissions instanceof PermissionsBitField &&
				interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
			)
		) {
			return {
				content: "権限がありません",
				flags: [MessageFlags.Ephemeral]
			} satisfies InteractionReplyOptions;
		}
		const role = interaction.values[0];
		if (!role) {
			return {
				content: "1つ以上選択してください",
				flags: [MessageFlags.Ephemeral]
			} satisfies InteractionReplyOptions;
		}
		const result = await database.guildTables.settings.bumpNoticeRole.update(
			interaction.guild.id,
			role
		);
		return {
			content: result ? `<@&${role}> に設定しました。` : "DATABASE_ERROR",
			flags: [MessageFlags.Ephemeral]
		} satisfies InteractionReplyOptions;
	}
}
