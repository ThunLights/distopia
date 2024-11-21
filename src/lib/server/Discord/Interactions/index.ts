import { Client } from "discord.js";

import { Commands } from "./Commands/index";

import type { CacheType, Interaction } from "discord.js";

export class InteractionResponse {
    public readonly commands: Commands

    constructor(private readonly client: Client) {
        this.commands = new Commands(this.client);
    }

    async reply(interaction: Interaction<CacheType>): Promise<void> {
        if (interaction.isContextMenuCommand()) {
            return;
        }
        if (interaction.isCommand()) {
            return await this.commands.reply(interaction);
        }
    }
}
