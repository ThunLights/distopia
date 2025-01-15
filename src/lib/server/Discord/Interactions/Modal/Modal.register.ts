import { database } from "$lib/server/Database/index";
import { getCategory } from "$lib/category";
import { ModalsBase, ModalsError } from "./Modal.base";
import { PUBLIC_URL } from "$env/static/public";

import type { ModalSubmitInteraction, CacheType, InteractionReplyOptions, MessagePayload } from "discord.js";

export class RegisterModals extends ModalsBase {
    public readonly customId = "register";

	public async commands(interaction: ModalSubmitInteraction<CacheType>): Promise<(InteractionReplyOptions & { fetchReply: true; }) | string | MessagePayload | ModalsError | null> {
		if (interaction.guild && interaction.guild.ownerId === interaction.user.id) {
			const category = getCategory(interaction.fields.getTextInputValue("category")) ? interaction.fields.getTextInputValue("category") : "general";
			const description = interaction.fields.getTextInputValue("description");
			const guildTmp = await database.guildTables.tmp.data(interaction.guild.id);
			if (!guildTmp) {
				return { content: "仮登録されていません", ephemeral: true } satisfies InteractionReplyOptions;
			}
			if (!description) {
				return { content: "説明が取得できませんでした。", ephemeral: true } satisfies InteractionReplyOptions;
			}
			const result = await database.guildTables.guild.update({
				...guildTmp,
				...{
					category: category,
					description: description.trim(),
				}
			});
			if (!result) {
				return { content: "データベースエラー", ephemeral: true } satisfies InteractionReplyOptions;
			}
			await database.guildTables.bump.update(guildTmp.guildId);
			await database.guildTables.bump.update(guildTmp.guildId);
			await database.guildTables.tmp.delete(guildTmp.guildId);
			return { content: `${PUBLIC_URL}/guilds/${interaction.guild.id}`, ephemeral: true } satisfies InteractionReplyOptions;
		}
		return null;
	}
}
