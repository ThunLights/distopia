import {} from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { database } from "$lib/server/Database/index";

import type { ButtonInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class BumpNoticeOffButton extends ButtonsBase {
	public readonly customId = "bumpNoticeOff";

	public async commands(interaction: ButtonInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		if (!interaction.guild) {
			return { content: "ERROR", ephemeral: true } satisfies InteractionReplyOptions;
		}
		const result = await database.guildTables.settings.bump.update(interaction.guild.id, false);
		if (!result) {
			return { content: "DATABASE_ERROR", ephemeral: true } satisfies InteractionReplyOptions;
		}
		return { content: "OFFにしました。", ephemeral: true } satisfies InteractionReplyOptions;
	}
}
