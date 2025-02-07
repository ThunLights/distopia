import { ActionRowBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { PUBLIC_HONORARY_MEMBER_ROLE_ID, PUBLIC_TICKET_CATEGORY_ID } from "$env/static/public";
import { database } from "$lib/server/Database/index";
import { ButtonsBase, ButtonsError } from "./Buttons.base";

import type { ButtonInteraction, CacheType, MessagePayload, InteractionReplyOptions, TextChannel, ButtonBuilder } from "discord.js";

export class TicketCreateButton extends ButtonsBase {
	public readonly customId = "ticketCreate";

	private async sendWelcomeMessage(interaction: ButtonInteraction<CacheType>, channel: TextChannel) {
		const embed = new EmbedBuilder()
			.setColor("Navy")
			.setTitle("削除申請フォーム")
			.setDescription("削除登録抹消に関わる証拠品(スクリーンショットなど)や反論等を記述してください");

		await channel.send({
			content: `<@${interaction.user.id}> <@&${PUBLIC_HONORARY_MEMBER_ROLE_ID}>`,
			embeds: [ embed ],
			components: [
				new ActionRowBuilder<ButtonBuilder>()
					.setComponents(),
			],
		});
	}

	public async commands(interaction: ButtonInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		if (!interaction.guild) {
			return { content: "ERR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		}
		const created = await database.ticket.fetch(interaction.user.id);
		if (created) {
			return { content: `<#${created.channelId}>`, flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		}

		const channel = await interaction.guild.channels.create({
			name: `削除申請-${interaction.user.username}`,
			parent: PUBLIC_TICKET_CATEGORY_ID,
		});

		await this.sendWelcomeMessage(interaction, channel);

		return { content: `<#${channel.id}>`, flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
	}
}
