import { ChannelType, MessageFlags, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { database } from "$lib/server/Database/index";
import { PUBLIC_HOME_SERVER_ID, PUBLIC_TICKET_ARCHIVE_CATEGORY_ID } from "$env/static/public";

import type {
	ButtonInteraction,
	CacheType,
	MessagePayload,
	InteractionReplyOptions
} from "discord.js";

export class TicketCloseButton extends ButtonsBase {
	public readonly customId = "ticketClose";

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
		const { channel } = interaction;
		const ticketData = await database.ticket.fetchChannelId(interaction.channelId);
		if (ticketData) {
			await database.ticket.remove(ticketData.userId);
		}
		setTimeout(async () => {
			if (channel && channel.type === ChannelType.GuildText && channel.parent) {
				await channel.setParent(PUBLIC_TICKET_ARCHIVE_CATEGORY_ID);
				await channel.permissionOverwrites.set([
					{
						id: interaction.guildId ?? PUBLIC_HOME_SERVER_ID,
						deny: [PermissionFlagsBits.ViewChannel]
					}
				]);
			}
		}, 3 * 1000);
		return {
			content: "数秒後にアーカイブされます。",
			flags: [MessageFlags.Ephemeral]
		} satisfies InteractionReplyOptions;
	}
}
