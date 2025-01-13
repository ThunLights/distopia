import type { ChannelSelectMenuInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";
import { ChannelsBase, ChannelsError } from "./Channel.base";
import { errorHandling } from "$lib/server/error";
import { database } from "$lib/server/Database";

export class NoticeChannel extends ChannelsBase {
	public readonly customId = "noticeChannel";

	public async commands(interaction: ChannelSelectMenuInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | ChannelsError | null> {
		try {
			const channel = interaction.values[0];
			if (!interaction.guild) {
				return { content: "ERROR", ephemeral: true } satisfies InteractionReplyOptions;
			}
			if (!channel) {
				return { content: "チャンネルを1つ選択してください", ephemeral: true } satisfies InteractionReplyOptions;
			}
			const result = await database.guildTables.settings.dangerousPeople.notice.update(interaction.guild.id, channel);
			if (!result) {
				return { content: "DATABASE_ERROR", ephemeral: true } satisfies InteractionReplyOptions;
			}
			return { content: `<#${channel}> に設定しました。`, ephemeral: true } satisfies InteractionReplyOptions;
		} catch (error) {
			errorHandling(error);
			return { content: "ERROR", ephemeral: true } satisfies InteractionReplyOptions;
		}
	}
}
