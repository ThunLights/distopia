import { MessageFlags, PermissionsBitField } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { database } from "$lib/server/Database/index";

import type {
	ButtonInteraction,
	CacheType,
	MessagePayload,
	InteractionReplyOptions
} from "discord.js";

export class TicketVoteEndButton extends ButtonsBase {
	public readonly customId = "ticketVoteEnd";

	public async commands(
		interaction: ButtonInteraction<CacheType>
	): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		if (
			!(
				interaction.memberPermissions &&
				interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)
			)
		) {
			return {
				content: "権限がありません",
				flags: [MessageFlags.Ephemeral]
			} satisfies InteractionReplyOptions;
		}
		const data = await database.ticket.votePanel.fetch(interaction.message.id);
		if (!data) {
			return { content: "ERR", flags: [MessageFlags.Ephemeral] } satisfies InteractionReplyOptions;
		}
		await interaction.message.edit({ components: [] });
		await database.ticket.vote.remove(data.targetUserId);
		await database.ticket.votePanel.remove(interaction.message.id);
		return {
			content: "投票を終了させました。",
			flags: [MessageFlags.Ephemeral]
		} satisfies InteractionReplyOptions;
	}
}
