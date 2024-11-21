import { ChatInputCommandInteraction, Client } from "discord.js";
import { CommandsBase, CommandsError } from "./Commands.base";

import type { CacheType, InteractionReplyOptions, MessagePayload } from "discord.js";

export class WebCommands extends CommandsBase {
    public commandName = "web";

    constructor(client: Client) {
        super(client);
    }

    async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
        return { content: "このコマンドは準備中です。", ephemeral: true } satisfies InteractionReplyOptions;
    }
}
