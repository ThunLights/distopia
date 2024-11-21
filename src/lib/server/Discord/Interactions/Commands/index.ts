import { Client } from "discord.js";

import { WebCommands } from "./Commands.web";

import type { ChatInputCommandInteraction, CacheType } from "discord.js";
import type { CommandsBase } from "./Commands.base";

export class Commands {
    public readonly commands: CommandsBase[]

    constructor(private readonly client: Client) {
        this.commands = [
            new WebCommands(this.client),
        ]
    }

    async reply(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        for (const command of this.commands) {
            const result = await command.commands(interaction);
            if (!result) {
                return result;
            }
        }

        return void await interaction.reply({ content: "Command Not Found", ephemeral: true });
    }
}
