import { PUBLIC_HOME_SERVER_ID, PUBLIC_OWNER_ID, PUBLIC_STAFF_ROLE_ID } from "$env/static/public";
import { database, DatabaseError } from "$lib/server/Database/index";
import { errorHandling } from "$lib/server/error";
import { CommandsBase, CommandsError } from "./Commands.base";
import { EmbedBuilder } from "discord.js";

import type { ChatInputCommandInteraction, CacheType, MessagePayload, InteractionReplyOptions } from "discord.js";

export class OnlyStaffCommand extends CommandsBase {
	public readonly commandName = "onlystaff";

	private async isStaff(userId: string) {
		try {
			const guild = this.client.guilds.cache.get(PUBLIC_HOME_SERVER_ID);
			if (guild) {
				const users = guild.members.cache.values().filter(member => member.roles.cache.has(PUBLIC_STAFF_ROLE_ID));
				return users.toArray().map(user => user.id).includes(userId);
			}

			return false;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
		if (!interaction.guild) {
			return { content: "ERROR", ephemeral: true } satisfies InteractionReplyOptions;
		}
		if (await this.isStaff(interaction.user.id)) {
			const subCommandGroup = interaction.options.getSubcommandGroup(true);
			if (subCommandGroup === "sales") {
				const commandName = interaction.options.getSubcommand();
				const guildId = interaction.options.getString("guildId") ?? "";
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
						return { content: "DATABASE_ERROR", ephemeral: true } satisfies InteractionReplyOptions;
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
						return { content: "DATABASE_ERROR", ephemeral: true } satisfies InteractionReplyOptions;
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
		return { content: "権限がありません", ephemeral: true } satisfies InteractionReplyOptions;
	}
}
