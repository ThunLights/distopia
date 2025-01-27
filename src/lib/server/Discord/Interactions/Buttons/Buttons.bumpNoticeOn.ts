import { MessageFlags } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { database } from "$lib/server/Database/index";

import type { ButtonInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class BumpNoticeOnButton extends ButtonsBase {
	public readonly customId = "bumpNoticeOn";

	public async commands(interaction: ButtonInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		if (!interaction.guild) {
			return { content: "ERROR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		}
		const result = await database.guildTables.settings.bump.update(interaction.guild.id, true);
		if (!result) {
			return { content: "DATABASE_ERROR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		}
		return { content: "ONにしました。", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
	}
}
