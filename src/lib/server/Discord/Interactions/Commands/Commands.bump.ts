import { ChannelType, Client, EmbedBuilder, MessageFlags } from "discord.js";

import { CommandsBase, CommandsError } from "./Commands.base";
import { database, DatabaseError } from "$lib/server/Database";

import type {
	CacheType,
	InteractionReplyOptions,
	ChatInputCommandInteraction,
	MessagePayload
} from "discord.js";

export class BumpCommands extends CommandsBase {
	public readonly commandName = "bump";
	public readonly lateLimit: Record<string, Date> = {};

	constructor(client: Client) {
		super(client);
	}

	async commands(
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
		if (!(interaction.guildId && interaction.guild)) {
			return new CommandsError("GUILD_ID_NOT_FOUND");
		}
		const guild = await database.guildTables.guild.id2Data(interaction.guildId);
		if (guild === null || guild instanceof DatabaseError) {
			return {
				content: "サーバーを本登録していないとこのコマンドは使えません。",
				flags: [MessageFlags.Ephemeral]
			} satisfies InteractionReplyOptions;
		}
		if (Object.keys(this.lateLimit).includes(guild.guildId)) {
			const termDate = this.lateLimit[guild.guildId];
			const nowDate = new Date();
			const between = 2 * 60 * 60 * 1000 - (nowDate.getTime() - termDate.getTime());
			const embed = new EmbedBuilder()
				.setColor("Red")
				.setTitle("Distopia: Discordサーバー掲示板")
				.setURL(`https://distopia.top/`)
				.setDescription(
					`レートリミットです。${Math.ceil(between / (60 * 1000))}分経ってから再度実行してください`
				);
			return { embeds: [embed], flags: [MessageFlags.Ephemeral] } satisfies InteractionReplyOptions;
		}
		const result = await database.guildTables.bump.update(guild.guildId);
		if (!result) {
			return {
				content: "データベースのエラーによりBUMPが出来ませんでした。",
				flags: [MessageFlags.Ephemeral]
			} satisfies InteractionReplyOptions;
		}
		await database.guildTables.bumpCounter.update(interaction.guild.id);
		const user = await database.user.data(interaction.user.id);
		if (user) {
			await database.user.update({
				...user,
				...{
					bumpCounter: user.bumpCounter ? user.bumpCounter + 1 : 1
				}
			});
		}
		this.lateLimit[guild.guildId] = new Date();
		setTimeout(
			async () => {
				try {
					const settings = await database.guildTables.settings.bump.fetch(guild.guildId);
					const bumpMessage = await database.guildTables.settings.bumpNoticeContent.fetch(
						guild.guildId
					);
					const mention = await database.guildTables.settings.bumpNoticeRole.fetch(guild.guildId);
					const embed = new EmbedBuilder()
						.setColor("Gold")
						.setTitle("Bumpが実行できますよ!!")
						.setURL(`https://distopia.top/`)
						.setDescription(
							bumpMessage
								? bumpMessage.content
								: `只今、前回のBumpから2時間がたちました。\n再度 </bump:${interaction.commandId}> を実行可能です。`
						);
					delete this.lateLimit[guild.guildId];
					if (
						settings &&
						settings.content &&
						interaction.channel &&
						interaction.channel.type === ChannelType.GuildText
					) {
						await interaction.channel.send({
							content: mention ? `<@&${mention.roleId}>` : undefined,
							embeds: [embed]
						});
					}
				} catch {
					//
				}
			},
			2 * 60 * 60 * 1000
		);
		const counter = await database.guildTables.bumpCounter.fetch(interaction.guild.id);
		const userCounter = await database.userBump.fetch(interaction.user.id);
		const embed = new EmbedBuilder()
			.setColor("Gold")
			.setTitle("Distopia: Discordサーバー掲示板")
			.setURL(`https://distopia.top/`)
			.setDescription(
				`合計Bump: ${counter ? counter.count : 0}回\n表示順を上げました。[こちら](https://distopia.top/)で確認できます。`
			)
			.setFields({
				name: `${interaction.user.displayName} 's Bump Score`,
				value: `合計: ${userCounter ? userCounter.count : 0}回`,
				inline: false
			});
		return { embeds: [embed] } satisfies InteractionReplyOptions;
	}
}
