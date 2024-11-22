import { ChatInputCommandInteraction, Client, MessagePayload } from "discord.js";

import { CommandsBase, CommandsError } from "./Commands.base";

import type { CacheType, InteractionReplyOptions } from "discord.js";

export class StaffCommands extends CommandsBase {
    public readonly commandName = "staff";

    constructor(client: Client) {
        super(client);
    }

    async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
        return { content: "このコマンドは準備中だよ。ごめんね。", ephemeral: true } satisfies InteractionReplyOptions;
    }
}
