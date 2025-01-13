import { ChannelType, Client, EmbedBuilder } from "discord.js";

import { CommandsBase, CommandsError } from "./Commands.base";
import { database, DatabaseError } from "$lib/server/Database";

import type { CacheType, InteractionReplyOptions, ChatInputCommandInteraction, MessagePayload } from "discord.js";

export class BumpCommands extends CommandsBase {
    public readonly commandName = "bump";
	public lateLimit: string[] = [];

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
		if (this.lateLimit.includes(guild.guildId)) {
			const embed = new EmbedBuilder()
				.setColor("Red")
				.setTitle("Distopia: Discordサーバー掲示板")
				.setURL(`https://distopia.top/`)
				.setDescription(`レートリミットです。時間を置いて再度実行してください`);
			return { embeds: [ embed ] } satisfies InteractionReplyOptions;
		}
        const result = await database.guildTables.bump.update(guild.guildId);
        if (!result) {
            return { content: "データベースのエラーによりBUMPが出来ませんでした。", ephemeral: true } satisfies InteractionReplyOptions;
        }
		this.lateLimit.push(guild.guildId);
		setTimeout(async () => {
			try {
				const settings = await database.guildTables.settings.bump.fetch(guild.guildId);
				const embed = new EmbedBuilder()
					.setColor("Gold")
					.setTitle("Bumpが実行できますよ!!")
					.setURL(`https://distopia.top/`)
					.setDescription("只今、前回のBumpから2時間がたちました。");

				this.lateLimit = this.lateLimit.filter(value => value !== guild.guildId);
				if (settings && settings.content && interaction.channel && interaction.channel.type === ChannelType.GuildText) {
					await interaction.channel.send({ embeds: [ embed ] });
				}
			} catch {}
		}, 2 * 60 * 60 * 1000)
        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle("Distopia: Discordサーバー掲示板")
            .setURL(`https://distopia.top/`)
            .setDescription(`表示順を上げました。[こちら](https://distopia.top/)で確認できます。`);
        return { embeds: [ embed ] } satisfies InteractionReplyOptions;
    }
}
