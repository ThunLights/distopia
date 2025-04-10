import { MessageFlags, PermissionsBitField } from "discord.js";
import { ModalsBase, ModalsError } from "./Modal.base";
import { errorHandling } from "$lib/server/error";
import { blank } from "$lib/blank";
import { database } from "$lib/server/Database/index";
import { codeBlock } from "$lib/codeblock";

import type {
	ModalSubmitInteraction,
	CacheType,
	InteractionReplyOptions,
	MessagePayload
} from "discord.js";

export class BumpNoticeContent extends ModalsBase {
	public readonly customId = "bumpNoticeContent";

	public async commands(
		interaction: ModalSubmitInteraction<CacheType>
	): Promise<
		(InteractionReplyOptions & { fetchReply: true }) | string | MessagePayload | ModalsError | null
	> {
		try {
			if (
				!(
					interaction.guildId &&
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
			const content = interaction.fields.getTextInputValue("content");
			if (blank(content)) {
				return {
					content: "空白のみは無効です。",
					flags: [MessageFlags.Ephemeral]
				} satisfies InteractionReplyOptions;
			}
			const result = await database.guildTables.settings.bumpNoticeContent.update(
				interaction.guildId,
				content.trim()
			);
			if (!result) {
				return {
					content: "DATABASE_ERROR",
					flags: [MessageFlags.Ephemeral]
				} satisfies InteractionReplyOptions;
			}
			return {
				content: `以下に設定しました。\n${codeBlock(content.trim())}`,
				flags: [MessageFlags.Ephemeral]
			} satisfies InteractionReplyOptions;
		} catch (error) {
			errorHandling(error);
			return {
				content: "ERROR",
				flags: [MessageFlags.Ephemeral]
			} satisfies InteractionReplyOptions;
		}
	}
}
