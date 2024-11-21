import { ChatInputCommandInteraction, Client } from "discord.js";
import { CommandsBase, CommandsError } from "./Commands.base";

import type { CacheType } from "discord.js";

export class WebCommands extends CommandsBase {
    constructor(client: Client) {
        super(client);
    }

    async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<void | CommandsError> {
    }
}
