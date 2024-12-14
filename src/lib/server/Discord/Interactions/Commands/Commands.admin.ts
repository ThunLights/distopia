import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder } from "discord.js";
import { CommandsBase, CommandsError } from "./Commands.base";

import type { CacheType, InteractionReplyOptions, MessagePayload, ChatInputCommandInteraction } from "discord.js";

export class AdminCommands extends CommandsBase {
    public readonly commandName = "admin";

    constructor(client: Client) {
        super(client);
    }

    async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
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

        return null;
    }
}
