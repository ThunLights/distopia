import {} from "discord.js";
import { ModalsBase, ModalsError } from "./Modal.base";
import { errorHandling } from "$lib/server/error";
import { database } from "$lib/server/Database/index";

import type { ModalSubmitInteraction, CacheType, InteractionReplyOptions, MessagePayload } from "discord.js";

export class AutoBanModal extends ModalsBase {
	public readonly customId = "autoBan";

	public async commands(interaction: ModalSubmitInteraction<CacheType>): Promise<(InteractionReplyOptions & { fetchReply: true; }) | string | MessagePayload | ModalsError | null> {
		try {
			const content = Number(interaction.fields.getTextInputValue("content"));
			if (!interaction.guild) {
				return { content: "ERROR", ephemeral: true } satisfies InteractionReplyOptions;
			}
			if (isNaN(content)) {
				return { content: "数字を入力してください", ephemeral: true } satisfies InteractionReplyOptions;
			}
			const result = await database.guildTables.settings.dangerousPeople.ban.update(interaction.guild.id, content);
			if (!result) {
				return { content: "DATABASE_ERROR", ephemeral: true } satisfies InteractionReplyOptions;
			}
			return { content: `${Math.floor(content)}に設定しました。`, ephemeral: true } satisfies InteractionReplyOptions;
		} catch (error) {
			errorHandling(error);
			return { content: "ERROR", ephemeral: true } satisfies InteractionReplyOptions;
		}
	}
}
