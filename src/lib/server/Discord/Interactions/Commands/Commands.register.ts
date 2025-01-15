import { getCategory } from "$lib/category";
import { database, DatabaseError } from "$lib/server/Database/index";
import { CommandsBase, CommandsError } from "./Commands.base";
import { ActionRowBuilder, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

import type { CacheType, ChatInputCommandInteraction, Client, InteractionReplyOptions, MessagePayload } from "discord.js";

export class RegisterCommands extends CommandsBase {
    public readonly commandName = "register";

    constructor(client: Client) {
        super(client);
    }

    async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<string | MessagePayload | InteractionReplyOptions | CommandsError | null | void> {
		let category = interaction.options.getString("category") ?? "general";
		if (interaction.guild && interaction.guild.ownerId === interaction.user.id) {
			if (!(interaction.channel && interaction.channel.type === ChannelType.GuildText)) {
				return { content: "テキストチャンネル以外に招待リンクを設定することはできません", ephemeral: true } satisfies InteractionReplyOptions;
			}
			const guild = await database.guildTables.guild.id2Data(interaction.guild.id);
			if (guild instanceof DatabaseError) {
				return { content: "登録チェック時にデータベースエラーが発生しました。", ephemeral: true } satisfies InteractionReplyOptions;
			}
			if (guild) {
				return { content: "正式登録が済んでいます。", ephemeral: true } satisfies InteractionReplyOptions;
			}
			category = getCategory(category) ? category : "general";
			const invite = await interaction.channel.createInvite({
				maxAge: 0,
				maxUses: 0,
			});
			const result = await database.guildTables.tmp.update({
				guildId: interaction.guild.id,
				name: interaction.guild.name,
				invite: invite.code,
				icon: interaction.guild.icon ?? undefined,
				banner: interaction.guild.banner ?? undefined,
			});
			const modal = new ModalBuilder()
				.setCustomId("register")
				.setTitle("サーバー説明を追加")
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder()
						.setCustomId("category")
						.setLabel("カテゴリ (変更すると自動で雑談カテゴリになります。)")
						.setMinLength(0)
						.setMaxLength(40)
						.setStyle(TextInputStyle.Short)
						.setValue(category)),
					new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder()
						.setCustomId("description")
						.setLabel("サーバー説明")
						.setMinLength(0)
						.setMaxLength(250)
						.setStyle(TextInputStyle.Paragraph))
				);
			if (!result) {
				return { content: "データベースへの書き込みがうまく行きませんでした", ephemeral: true } satisfies InteractionReplyOptions;
			}
			return await interaction.showModal(modal);
		}
		return { content: "オーナー以外は登録できません", ephemeral: true } satisfies InteractionReplyOptions;
	}
}
