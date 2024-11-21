import { Client } from "discord.js";

import type { CacheType, ChatInputCommandInteraction } from "discord.js";

export class CommandsError {
    constructor(public readonly content: string) {}
}

export abstract class CommandsBase {
    constructor(private readonly client: Client) {}

    async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<void | CommandsError> {
        return
    }
}
