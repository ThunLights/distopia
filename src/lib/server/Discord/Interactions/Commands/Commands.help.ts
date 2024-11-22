import { ChatInputCommandInteraction, Client, MessagePayload } from "discord.js";

import { CommandsBase, CommandsError } from "./Commands.base";

import type { CacheType, InteractionReplyOptions } from "discord.js";

export class HelpCommands extends CommandsBase {
    public readonly commandName = "help";

    constructor(client: Client) {
        super(client);
    }

    async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
        return { content: "ヘルプコマンドは作り途中だよ。ごめんね。", ephemeral: true } satisfies InteractionReplyOptions;
    }
}
