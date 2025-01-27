import { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, EmbedBuilder, MessageFlags, PermissionsBitField } from "discord.js";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { errorHandling } from "$lib/server/error";

import type { ButtonInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class NoticeChannelButton extends ButtonsBase {
	public readonly customId = "noticeChannel";

	public async commands(interaction: ButtonInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		try {
			if (!(
				interaction.member
				&& interaction.member.permissions
				&& interaction.member.permissions instanceof PermissionsBitField
				&& interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
			)) {
				return { content: "権限がありません", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
			}

			const embed = new EmbedBuilder()
				.setColor("Navy")
				.setTitle("危険人物お知らせチャンネル")
				.setDescription("以下でチャンネルをセレクトしてください。");
			const selectMenu = new ChannelSelectMenuBuilder()
				.setCustomId("noticeChannel")
				.addChannelTypes(ChannelType.GuildText);
			const component = new ActionRowBuilder<ChannelSelectMenuBuilder>()
				.addComponents(selectMenu);

			return void await interaction.reply({
				embeds: [ embed ],
				components: [ component ],
				flags: [ MessageFlags.Ephemeral ],
			});
		} catch (error) {
			errorHandling(error);
			return { content: "ERROR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		}
	}
}
