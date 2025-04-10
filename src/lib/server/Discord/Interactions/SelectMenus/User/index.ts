import { codeBlock } from "$lib/codeblock";
import { Owner } from "./User.actingOwner";
import { MessageFlags } from "discord.js";

import type { CacheType, Client, UserSelectMenuInteraction } from "discord.js";
import type { UsersBase } from "./User.base";

export class UserSelectMenu {
	public readonly commands: UsersBase[];

	constructor(client: Client) {
		this.commands = [new Owner(client)];
	}

	public async reply(interaction: UserSelectMenuInteraction<CacheType>): Promise<void> {
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
