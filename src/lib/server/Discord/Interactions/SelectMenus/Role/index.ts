import { codeBlock } from "$lib/codeblock";
import { MessageFlags } from "discord.js";

import { BumpRole } from "./Role.bumpRole";

import type { CacheType, Client, RoleSelectMenuInteraction } from "discord.js";
import type { RolesBase } from "./Role.base";

export class RoleSelectMenu {
	public readonly commands: RolesBase[];

	constructor(client: Client) {
		this.commands = [new BumpRole(client)];
	}

	public async reply(interaction: RoleSelectMenuInteraction<CacheType>): Promise<void> {
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
