import { ChannelType, EmbedBuilder } from "discord.js";
import { database } from "$lib/server/Database/index";
import { DangerousPeople } from "$lib/dangerousPeople";
import { codeBlock } from "$lib/codeblock";

import type { Client } from "discord.js";

export class DangerousPeopleClient {
	constructor(private readonly client: Client) {}

	public async updatePanel() {
		let description = "";
		for (const element of DangerousPeople.elementsList()) {
			description += `${element.score}: ${element.label}\n`;
		}

		const embed = new EmbedBuilder()
			.setColor("Gold")
			.setTitle("危険人物スコア票")
			.setDescription(codeBlock(description));

		const panels = await database.panel.dangerousPeopleScore.findMany();
		for (const panel of panels) {
			const channel = await this.client.channels.fetch(panel.channelId);
			if (channel && channel.type === ChannelType.GuildText) {
				const message = await channel.messages.fetch(panel.messageId);
				await message.edit({ embeds: [embed], components: [] });
			}
		}
	}
}
