import { Client } from "discord.js";
import { CommandsBase, CommandsError } from "./Commands.base";

import type { CacheType, InteractionReplyOptions, MessagePayload, ChatInputCommandInteraction } from "discord.js";

export class AdminCommands extends CommandsBase {
    public readonly commandName = "admin";

    constructor(client: Client) {
        super(client);
    }

    async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
        return { content: "このコマンドは準備中です。", ephemeral: true } satisfies InteractionReplyOptions;
    }
}
