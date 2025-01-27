import { PUBLIC_OWNER_ID } from "$env/static/public";
import { database, DatabaseError } from "$lib/server/Database/index";
import { CommandsBase, CommandsError } from "./Commands.base";
import { EmbedBuilder, MessageFlags } from "discord.js";
import { Guild } from "../../Controller/Controller.guild";

import type { ChatInputCommandInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class OnlyStaffCommand extends CommandsBase {
	public readonly commandName = "onlystaff";

	public async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
		if (!interaction.guild) {
			return { content: "ERROR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
		}
		if (await Guild.isStaff(interaction.user.id, this.client)) {
			const subCommandGroup = interaction.options.getSubcommandGroup(true);
			if (subCommandGroup === "sales") {
				const commandName = interaction.options.getSubcommand();
				const guildId = interaction.options.getString("guild") ?? "";
				const isRegisteredServer = await database.guildTables.guild.id2Data(guildId);
				const isRegistered = await database.sales.fetch(guildId);

				if (isRegisteredServer && !(isRegisteredServer instanceof DatabaseError)) {
					const embed = new EmbedBuilder()
						.setColor("Red")
						.setTitle("既にDistopiaに登録されています。")
						.setDescription(`${guildId}は登録済みです。`);
					return { embeds: [ embed ] } satisfies InteractionReplyOptions;
				}
				if (commandName === "add") {
					if (isRegistered) {
						const embed = new EmbedBuilder()
							.setColor("Red")
							.setTitle("既に営業されています。")
							.setDescription(`<@${isRegistered.userId}> が営業しています。`);
						return { embeds: [ embed ] } satisfies InteractionReplyOptions;
					}
					const result = await database.sales.update(guildId, interaction.user.id);
					if (!result) {
						return { content: "DATABASE_ERROR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
					}
					const embed = new EmbedBuilder()
						.setColor("Green")
						.setTitle("営業済みに追加しました。")
						.setDescription("何やってるんですか？営業してください！");
					return { embeds: [ embed ] } satisfies InteractionReplyOptions;
				}
				if (commandName === "remove" && interaction.user.id === PUBLIC_OWNER_ID) {
					const result = await database.sales.remove(guildId);
					const embed = new EmbedBuilder()
						.setColor("Green")
						.setTitle("削除しました。")
						.setDescription(`${guildId} を削除しました`);
					if (!result) {
						return { content: "DATABASE_ERROR", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
					}
					return { embeds: [ embed ] } satisfies InteractionReplyOptions;
				}
				if (commandName === "check") {
					const embed = isRegistered
						? new EmbedBuilder()
							.setColor("Red")
							.setTitle("既に営業されています。")
							.setDescription(`<@${isRegistered.userId}> が営業しています。`)
						: new EmbedBuilder()
							.setColor("Green")
							.setTitle("営業されていません")
							.setDescription("営業しましょう! By ROBOT");
					return { embeds: [ embed ] } satisfies InteractionReplyOptions;
				}
			}
		}
		return { content: "権限がありません", flags: [ MessageFlags.Ephemeral ] } satisfies InteractionReplyOptions;
	}
}
