import { codeBlock } from "$lib/codeblock";
import { NoticeChannel } from "./Channel.noticeChannel";
import { MessageFlags } from "discord.js";

import type { CacheType, ChannelSelectMenuInteraction, Client } from "discord.js";
import type { ChannelsBase } from "./Channel.base";

export class ChannelSelectMenu {
	public readonly commands: ChannelsBase[];

	constructor(private readonly client: Client) {
		this.commands = [new NoticeChannel(this.client)];
	}

	public async reply(interaction: ChannelSelectMenuInteraction<CacheType>): Promise<void> {
		for (const command of this.commands) {
			if (command.customId === interaction.customId) {
				const result = await command.reply(interaction);
				if (result) {
					return void (await interaction.reply({
						content: codeBlock(`Error: ${result.content}`),
						flags: [MessageFlags.Ephemeral]
					}));
				} else {
					return result;
				}
			}
		}

		return void (await interaction.reply({
			content: "Command Not Found",
			flags: [MessageFlags.Ephemeral]
		}));
	}
}
