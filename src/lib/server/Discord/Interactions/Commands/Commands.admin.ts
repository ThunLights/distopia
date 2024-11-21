import { ChatInputCommandInteraction, Client } from "discord.js";
import { CommandsBase, CommandsError } from "./Commands.base";

import type { CacheType, InteractionReplyOptions, MessagePayload } from "discord.js";

export class AdminCommands extends CommandsBase {
    public commandName = "admin";

    constructor(client: Client) {
        super(client);
    }

    async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
        const group = interaction.options.getSubcommandGroup(true);
        if (group === "permission") {
//            const commandName = interaction.options.getSubcommand();
//            if (commandName === "add") {}
//            if (commandName === "remove") {}
            return { content: "このコマンドは準備中です。", ephemeral: true } satisfies InteractionReplyOptions;
        }
        return null;
    }
}
