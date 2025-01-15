import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Client, EmbedBuilder } from "discord.js";
import { CommandsBase, CommandsError } from "./Commands.base";
import { PUBLIC_OWNER_ID } from "$env/static/public";
import { codeBlock } from "$lib/codeblock";
import { DangerousPeople } from "$lib/dangerousPeople";
import { database } from "$lib/server/Database/index";

import type { CacheType, InteractionReplyOptions, MessagePayload, ChatInputCommandInteraction } from "discord.js";

export class AdminCommands extends CommandsBase {
    public readonly commandName = "admin";

    constructor(client: Client) {
        super(client);
    }

    async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
		if (interaction.user.id === PUBLIC_OWNER_ID) {
			const commandName = interaction.options.getSubcommand();
			if (commandName === "ranking") {
				const embed = new EmbedBuilder()
					.setTitle("ランキングパネルを設置します。")
					.setDescription("どちらを設置するか選んでください")
					.setColor("Gold");
	
				const levelButton = new ButtonBuilder()
					.setCustomId("RankingPanelLevel")
					.setLabel("レベル")
					.setStyle(ButtonStyle.Primary);
				const rateButton = new ButtonBuilder()
					.setCustomId("RankingPanelRate")
					.setLabel("アクティブレート")
					.setStyle(ButtonStyle.Primary);
				const component = new ActionRowBuilder<ButtonBuilder>()
					.addComponents(levelButton, rateButton);
	
				return { embeds: [ embed ], components: [ component ] } satisfies InteractionReplyOptions;
			}
			if (commandName === "status") {
				const embed = new EmbedBuilder()
					.setColor("Gold")
					.setTitle("ステータス")
					.setDescription(`ping: ${this.client.ws.ping}`);
				return { embeds: [ embed ], ephemeral: true } satisfies InteractionReplyOptions;
			}
			if (commandName === "score") {
				if (!(interaction.channel && interaction.channel.type === ChannelType.GuildText)) {
					return { content: "テキストチャンネルのみで実行可能です。", ephemeral: true } satisfies InteractionReplyOptions;
				}
				if (!interaction.guild) {
					return { content: "ERROR", ephemeral: true } satisfies InteractionReplyOptions;
				}

				let description = "";
				for (const element of DangerousPeople.elementsList()) {
					description += `${element.score}: ${element.label}\n`;
				}

				const embed = new EmbedBuilder()
					.setColor("Gold")
					.setTitle("危険人物スコア票")
					.setDescription(codeBlock(description));
				const message = await interaction.channel.send({ embeds: [ embed ] });
				const result = await database.panel.dangerousPeopleScore.update(interaction.guild.id, interaction.channelId, message.id);
				if (!result) {
					return { content: "DATABASE_ERROR", ephemeral: true } satisfies InteractionReplyOptions;
				}
				return { content: message.url, ephemeral: true } satisfies InteractionReplyOptions;
			}
		}
        return { content: "権限がありません", ephemeral: true } satisfies InteractionReplyOptions;
    }
}
