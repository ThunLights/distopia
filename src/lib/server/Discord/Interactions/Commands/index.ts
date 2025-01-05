import { Client } from "discord.js";
import { codeBlock } from "$lib/codeblock";

import { WebCommands } from "./Commands.web";
import { AdminCommands } from "./Commands.admin";
import { HelpCommands } from "./Commands.help";
import { BumpCommands } from "./Commands.bump";
import { StaffCommands } from "./Commands.staff";
import { RegisterCommands } from "./Commands.register";
import { FriendCommand } from "./Commands.friend";

import type { ChatInputCommandInteraction, CacheType } from "discord.js";
import type { CommandsBase } from "./Commands.base";

export class Commands {
    public readonly commands: CommandsBase[]

    constructor(private readonly client: Client) {
        this.commands = [
            new WebCommands(this.client),
            new AdminCommands(this.client),
            new HelpCommands(this.client),
            new BumpCommands(this.client),
            new StaffCommands(this.client),
			new RegisterCommands(this.client),
			new FriendCommand(this.client),
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
