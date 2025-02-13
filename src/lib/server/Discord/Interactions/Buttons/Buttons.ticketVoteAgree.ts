import { MessageFlags } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { database } from "$lib/server/Database/index";
import { codeBlock } from "$lib/codeblock";

import type { ButtonInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class TicketVoteAgreeButton extends ButtonsBase {
	public readonly customId = "ticketVoteAgree";

	public async commands(interaction: ButtonInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		const data = await database.ticket.votePanel.fetch(interaction.message.id);
		if (!data) {
			return { content: "ERR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		}
		await database.ticket.vote.update(data.targetUserId, interaction.user.id, true);
		const result = await database.ticket.vote.fetchResult(data.targetUserId);
		if (result) {
			await interaction.message.edit({
				content: `投票状況\n${codeBlock(`賛成:${result.agree} vs 反対:${result.disagree}`)}`,
			});
		}
		return { content: "賛成に投票しました。", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
	}
}
