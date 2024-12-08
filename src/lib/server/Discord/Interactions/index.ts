import { Client } from "discord.js";

import { Commands } from "./Commands/index";
import { Modals } from "./Modal/index";

import type { CacheType, Interaction } from "discord.js";

export class InteractionResponse {
    public readonly commands: Commands
	public readonly modals: Modals

    constructor(private readonly client: Client) {
        this.commands = new Commands(this.client);
		this.modals = new Modals(this.client);
    }

    async reply(interaction: Interaction<CacheType>): Promise<void> {
        if (interaction.isContextMenuCommand()) {
            return;
        }
        if (interaction.isCommand()) {
            return await this.commands.reply(interaction);
        }
		if (interaction.isModalSubmit()) {
			interaction
			return await this.modals.reply(interaction);
		}
    }
}
