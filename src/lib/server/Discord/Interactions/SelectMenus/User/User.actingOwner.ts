import { UsersBase, UsersError } from "./User.base";
import { errorHandling } from "$lib/server/error";
import { database } from "$lib/server/Database/index";
import { PermissionsBitField } from "discord.js";

import type { UserSelectMenuInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class Owner extends UsersBase {
	public readonly customId = "actingOwner";

	public async commands(interaction: UserSelectMenuInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | UsersError | null> {
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
			const user = interaction.values[0];
			if (!user) {
				return { content: "1人以上選択してください", ephemeral: true } satisfies InteractionReplyOptions;
			}
			const result = await database.guildTables.settings.owner.update(interaction.guild.id, user);
			return { content: result ? `<@${user}> をオーナー代理に設定しました。` : "DATABASE_ERROR", ephemeral: true } satisfies InteractionReplyOptions;
		} catch (error) {
			errorHandling(error);
			return { content: "ERROR", ephemeral: true } satisfies InteractionReplyOptions;
		}
	}
}
