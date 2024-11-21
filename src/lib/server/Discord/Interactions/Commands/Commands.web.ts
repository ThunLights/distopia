import { ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";
import { CommandsBase, CommandsError } from "./Commands.base";
import { database, DatabaseError } from "$lib/server/Database";

import type { CacheType, InteractionReplyOptions, MessagePayload } from "discord.js";

export class WebCommands extends CommandsBase {
    public commandName = "web";

    constructor(client: Client) {
        super(client);
    }

    async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
        const commandName = interaction.options.getSubcommand();
        if (!(interaction.guildId && interaction.guild)) {
            return new CommandsError("GUILD_ID_NOT_FOUND");
        }

        if (commandName === "register") {}
        if (commandName === "invite") {}
        if (commandName === "page") {
            const guild = await database.guildTables.guild.id2Data(interaction.guildId);
            if (guild instanceof DatabaseError || guild === null) {
                return { content: "サーバーが見つかりませんでした。正式登録が済んでいるか確認してみてください。", ephemeral: true } satisfies InteractionReplyOptions;
            }
            if (guild) {
                return { content: `https://distopia.top/guilds/${guild.guildId}` } satisfies InteractionReplyOptions;
            }
        }

        return null;
    }
}
