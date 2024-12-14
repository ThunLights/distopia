import { PUBLIC_URL } from "$env/static/public";
import { compressTxt } from "$lib/compress";
import { database } from "$lib/server/Database/index";
import { errorHandling } from "$lib/server/error";
import { id2Guild } from "$lib/server/guild";
import { formatDate } from "$lib/server/date";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { EmbedBuilder } from "discord.js";

import type { ButtonInteraction, CacheType, InteractionReplyOptions, MessagePayload } from "discord.js";

export class RankingLevelButton extends ButtonsBase {
	public readonly customId = "RankingPanelLevel";

	public async commands(interaction: ButtonInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		try {
			if (!interaction.guild) {
				return null;
			}
			const ranking = await database.guildTables.level.ranking(20);
			const databaseUpdateResult = await database.rankingPanel.level.update(interaction.guild.id, interaction.channelId, interaction.message.id);
			if (!databaseUpdateResult) {
				return { content: "データベースエラー", ephemeral: true } satisfies InteractionReplyOptions;
			}
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
			await interaction.message.edit({ embeds: [ embed ], components: [] });
			return { content: "更新しました。", ephemeral: true } satisfies InteractionReplyOptions;
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}
