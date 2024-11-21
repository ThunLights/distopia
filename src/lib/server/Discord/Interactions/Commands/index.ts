import { Client } from "discord.js";

import { WebCommands } from "./Commands.web";

import type { ChatInputCommandInteraction, CacheType } from "discord.js";
import type { CommandsBase } from "./Commands.base";
import { AdminCommands } from "./Commands.admin";

export class Commands {
    public readonly commands: CommandsBase[]

    constructor(private readonly client: Client) {
        this.commands = [
            new WebCommands(this.client),
            new AdminCommands(this.client),
        ]
    }

    async reply(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        for (const command of this.commands) {
            if (command.commandName === interaction.commandName) {
                const result = await command.reply(interaction);
                if (result) {
                    return void await interaction.reply({ content: codeBlock(`Error: ${result.content}`), ephemeral: true });
                } else {
                    return result;
                }
            }
        }

        return void await interaction.reply({ content: "Command Not Found", ephemeral: true });
    }
}
