import { errorHandling } from "$lib/server/error";
import { database } from "$lib/server/Database/index";
import { formatDate } from "$lib/server/date";
import { PUBLIC_URL } from "$env/static/public";
import { id2Guild } from "$lib/server/guild";
import { compressTxt } from "$lib/compress";

import { ChannelType, EmbedBuilder } from "discord.js";
import { parseRanking } from "../ranking";

import type { Client } from "discord.js";

export class RankingClient {
	constructor(private readonly client: Client) {}

	private async updateLevel() {
		try {
			const guilds = await database.guildTables.level.ranking();
			for (const guild of guilds) {
				const { guildId } = guild;
				const rank = parseRanking(guildId, guilds.map(value => {return {
					guildId: value.guildId,
					content: value.level,
				}}));
				if (rank) {
					await database.archives.level.ranking.update(guildId, BigInt(Math.ceil(rank)));
				}
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	private async updateActiveRate() {
		try {
			const guilds = await database.guildTables.activeRate.ranking();
			for (const guild of guilds) {
				const { guildId } = guild;
				const rank = parseRanking(guildId, guilds);
				if (rank) {
					await database.archives.activeRate.ranking.update(guildId, BigInt(Math.ceil(rank)));
				}
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	private async updateLevelPanel() {
		try {
			const ranking = await database.guildTables.level.ranking(20);
			const date = formatDate(new Date(new Date().toLocaleDateString("ja-JP")));
			const embed = new EmbedBuilder()
				.setTitle("サーバーランキング: レベル")
				.setDescription(`ここでは20位までしか表示されません。追加で見たい場合は[こちら](${PUBLIC_URL}/ranking?type=level)にアクセスお願いします。`)
				.setColor("Purple")
				.setURL(`${PUBLIC_URL}/ranking?type=level`)
				.setFooter({ text: `最終更新: ${date}` });
			for (let i = 0; i < ranking.length; i++) {
				const { guildId } = ranking[i];
				const guild = await id2Guild(guildId);
				if (!(typeof guild === "string")) {
					embed.addFields({ name: `${i+1}: ${guild.name}`, value: `${compressTxt(guild.description.replaceAll("\n", ""), 40)}` });
				}
			}

			const panels = await database.rankingPanel.level.findMany();
			for (const panel of panels) {
				const channel = await this.client.channels.fetch(panel.channelId);
				if (channel && channel.type === ChannelType.GuildText) {
					const message = await channel.messages.fetch(panel.messageId);
					await message.edit({ embeds: [ embed ], components: [] });
				}
			}
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	private async updateRatePanel() {
		try {
			const ranking = await database.guildTables.activeRate.ranking(20);
			const date = formatDate(new Date(new Date().toLocaleDateString("ja-JP")));
			const embed = new EmbedBuilder()
				.setTitle("サーバーランキング: アクティブレート")
				.setDescription(`ここでは20位までしか表示されません。追加で見たい場合は[こちら](${PUBLIC_URL}/ranking?type=activeRate)にアクセスお願いします。`)
				.setColor("Purple")
				.setURL(`${PUBLIC_URL}/ranking?type=activeRate`)
				.setFooter({ text: `最終更新: ${date}` });
			for (let i = 0; i < ranking.length; i++) {
				const { guildId } = ranking[i];
				const guild = await id2Guild(guildId);
				if (!(typeof guild === "string")) {
					embed.addFields({ name: `${i+1}: ${guild.name}`, value: `${compressTxt(guild.description.replaceAll("\n", ""), 40)}` });
				}
			}
			const panels = await database.rankingPanel.rate.findMany();
			for (const panel of panels) {
				const channel = await this.client.channels.fetch(panel.channelId);
				if (channel && channel.type === ChannelType.GuildText) {
					const message = await channel.messages.fetch(panel.messageId);
					await message.edit({ embeds: [ embed ], components: [] });
				}
			}
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async udpate() {
		await this.updateLevel();
		await this.updateActiveRate();
	}

	public async updatePanel() {
		await this.updateLevelPanel();
		await this.updateRatePanel();
	}
}
