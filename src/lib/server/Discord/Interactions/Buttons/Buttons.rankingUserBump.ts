import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { database } from "$lib/server/Database/index";
import { EmbedBuilder, MessageFlags } from "discord.js";
import { errorHandling } from "$lib/server/error";
import { formatDate } from "$lib/server/date";
import { PUBLIC_URL } from "$env/static/public";
import { discord } from "$lib/server/discord";

import type {
	ButtonInteraction,
	CacheType,
	MessagePayload,
	InteractionReplyOptions
} from "discord.js";

export class RankingUserBumpButton extends ButtonsBase {
	public readonly customId = "RankingPanelUserBump";

	public async commands(
		interaction: ButtonInteraction<CacheType>
	): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		try {
			if (!interaction.guild) {
				return null;
			}
			const ranking = await database.user.findMany({
				orderBy: {
					bumpCounter: "desc"
				},
				take: 20
			});
			const databaseUpdateResult = await database.rankingPanel.userBump.update(
				interaction.guild.id,
				interaction.channelId,
				interaction.message.id
			);
			if (!databaseUpdateResult) {
				return {
					content: "データベースエラー",
					flags: [MessageFlags.Ephemeral]
				} satisfies InteractionReplyOptions;
			}
			const date = formatDate(new Date(new Date().toLocaleDateString("ja-JP")));
			const embed = new EmbedBuilder()
				.setTitle("サーバーランキング: アクティブレート")
				.setDescription(
					`ここでは20位までしか表示されません。追加で見たい場合は[こちら](${PUBLIC_URL}/ranking?type=userBump)にアクセスお願いします。`
				)
				.setColor("Purple")
				.setURL(`${PUBLIC_URL}/ranking?type=userBump`)
				.setFooter({ text: `最終更新: ${date}` });
			for (let i = 0; i < ranking.length; i++) {
				const { id, bumpCounter } = ranking[i];
				const user = await discord.bot.control.user.fetch(id);
				if (user) {
					embed.addFields({
						name: `${i + 1}: ${user.displayName}`,
						value: `合計: ${bumpCounter ?? 0}回\nユーザーネーム: ${user.username} (ID: ${user.id})`
					});
				}
			}
			await interaction.message.edit({ embeds: [embed], components: [] });
			return {
				content: "更新しました。",
				flags: [MessageFlags.Ephemeral]
			} satisfies InteractionReplyOptions;
		} catch (error) {
			errorHandling(error);
			return {
				content: "ERROR",
				flags: [MessageFlags.Ephemeral]
			} satisfies InteractionReplyOptions;
		}
	}
}
