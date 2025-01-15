import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { CommandsBase, CommandsError } from "./Commands.base";
import { database } from "$lib/server/Database/index";
import { CHARACTER_LIMIT, TAG_COUNT_LIMIT } from "$lib/constants";

import type { ChatInputCommandInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class FriendCommand extends CommandsBase {
    public readonly commandName = "friend";

	public async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
		const modal = new ModalBuilder()
			.setCustomId("friend")
			.setTitle("フレンド募集 (ウェブサイトに表示されます。)")
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId("nsfw")
						.setLabel("R18にしたい場合は下記にokと入力してください")
						.setValue("no")
						.setStyle(TextInputStyle.Short)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId("tags")
						.setLabel(`検索タグ (最大${TAG_COUNT_LIMIT}}個, 最大${CHARACTER_LIMIT.tag}文字, Enterで区切り)`)
						.setStyle(TextInputStyle.Paragraph)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId("profile")
						.setLabel("自己紹介")
						.setStyle(TextInputStyle.Paragraph)
				),
			);
		return await interaction.showModal(modal);
	}
}
