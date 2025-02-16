import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, PermissionsBitField } from "discord.js";
import { CommandsBase, CommandsError } from "./Commands.base";
import { database } from "$lib/server/Database/index";

import type { ChatInputCommandInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class SettingsCommand extends CommandsBase {
	public readonly commandName = "settings";

	public async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
		if (
			interaction.guild
			&& interaction.member
			&& interaction.member.permissions
			&& interaction.member.permissions instanceof PermissionsBitField
			&& interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
		) {
			const bumpNotice = await database.guildTables.settings.bump.fetch(interaction.guild.id);
			const autoBan = await database.guildTables.settings.dangerousPeople.ban.fetch(interaction.guild.id);
			const noticeChannel = await database.guildTables.settings.dangerousPeople.notice.fetch(interaction.guild.id);
			const bumpRole = await database.guildTables.settings.bumpNoticeRole.fetch(interaction.guild.id);
			const actingOwner = await database.guildTables.settings.owner.fetch(interaction.guild.id);
			const bumpNoticeContent = await database.guildTables.settings.bumpNoticeContent.fetch(interaction.guild.id);

			const bumptNoticeValue = bumpNotice
				? bumpNotice.content
					? "有効"
					: "無効"
				: "未設定";
			const autoBanValue = autoBan
				? `危険度スコア${autoBan.score}以上でBAN`
				: "未設定";
			const noticeChannelValue = noticeChannel
				? `出力チャンネル: <#${noticeChannel.channelId}>`
				: "未設定";
			const bumpRoleValue = bumpRole
				? `<@&${bumpRole.roleId}>`
				: "未設定";
			const actingOwnerValue = actingOwner
				? `<@${actingOwner.userId}>`
				: "未設定";
			const bumpNoticeContentValue = bumpNoticeContent
				? bumpNoticeContent.content
				: "未設定";

			const embed = new EmbedBuilder()
				.setColor("Navy")
				.setTitle("設定パネル")
				.setDescription("設定を色々変えられます。")
				.addFields(
					{ name: "Bump通知", value: bumptNoticeValue, inline: false },
					{ name: "危険人物自動BAN", value: autoBanValue, inline: false },
					{ name: "危険人物予報チャンネル", value: noticeChannelValue, inline: false },
					{ name: "Bump通知用ロール", value: bumpRoleValue, inline: false },
					{ name: "Bump通知内容", value: bumpNoticeContentValue, inline: false },
					{ name: "オーナー代理", value: actingOwnerValue, inline: false },
				);

			const bumpNoticeButton = new ButtonBuilder()
				.setCustomId("bumpNotice")
				.setLabel("Bump通知")
				.setStyle(ButtonStyle.Success);
			const autoBanButton = new ButtonBuilder()
				.setCustomId("autoBan")
				.setLabel("AutoBan設定")
				.setStyle(ButtonStyle.Success);
			const noticeChannelButton = new ButtonBuilder()
				.setCustomId("noticeChannel")
				.setLabel("危険人物通知チャンネル")
				.setStyle(ButtonStyle.Success);
			const bumpRoleButton = new ButtonBuilder()
				.setCustomId("bumpRole")
				.setLabel("Bump通知ロール")
				.setStyle(ButtonStyle.Primary);
			const actingOwnerButton = new ButtonBuilder()
				.setCustomId("actingOwner")
				.setLabel("代理オーナー設定")
				.setStyle(ButtonStyle.Danger);
			const bumpNoticeContentButton = new ButtonBuilder()
				.setCustomId("bumpNoiceContent")
				.setLabel("Bump時のメッセージを変更")
				.setStyle(ButtonStyle.Success);

			return {
				embeds: [ embed ],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(autoBanButton, noticeChannelButton, actingOwnerButton),
					new ActionRowBuilder<ButtonBuilder>().addComponents(bumpNoticeButton, bumpRoleButton, bumpNoticeContentButton),
				],
				flags: [ MessageFlags.Ephemeral ]
			} satisfies InteractionReplyOptions;
		}

		return { content: "権限がありません", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
	}
}
