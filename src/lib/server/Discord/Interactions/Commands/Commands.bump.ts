import { Client, EmbedBuilder } from "discord.js";

import { CommandsBase, CommandsError } from "./Commands.base";
import { database, DatabaseError } from "$lib/server/Database";

import type { CacheType, InteractionReplyOptions, ChatInputCommandInteraction, MessagePayload } from "discord.js";

export class BumpCommands extends CommandsBase {
    public readonly commandName = "bump";

    constructor(client: Client) {
        super(client);
    }

    async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
        if (!(interaction.guildId && interaction.guild)) {
            return new CommandsError("GUILD_ID_NOT_FOUND");
        }
        const guild = await database.guildTables.guild.id2Data(interaction.guildId);
        if (guild === null || guild instanceof DatabaseError) {
            return { content: "サーバーを本登録していないとこのコマンドは使えません。", ephemeral: true } satisfies InteractionReplyOptions;
        }
        const result = await database.guildTables.bump.update(guild.guildId);
        if (!result) {
            return { content: "データベースのエラーによりBUMPが出来ませんでした。", ephemeral: true } satisfies InteractionReplyOptions;
        }
        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle("Distopia: Discordサーバー掲示板")
            .setURL(`https://distopia.top/`)
            .setDescription(`表示順を上げました。[こちら](https://distopia.top/)で確認できます。`);
        return { embeds: [ embed ] } satisfies InteractionReplyOptions;
    }
}
