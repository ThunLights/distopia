import { codeBlock } from "$lib/codeblock";

import type { ButtonInteraction, CacheType, Client } from "discord.js";
import type { ButtonsBase } from "./Buttons.base";
import { RankingRateButton } from "./Buttons.rankingRate";
import { RankingLevelButton } from "./Buttons.rankinglevel";

export class Buttons {
	public readonly buttons: ButtonsBase[]

	constructor(private readonly client: Client) {
		this.buttons = [
			new RankingRateButton(this.client),
			new RankingLevelButton(this.client),
		];
	}
	async reply(interaction: ButtonInteraction<CacheType>): Promise<void> {
		for (const button of this.buttons) {
			if (button.customId === interaction.customId) {
				const result = await button.reply(interaction);
				if (result) {
					return void await interaction.reply({ content: codeBlock(`Error: ${result.content}`), ephemeral: true });
				} else {
					return result;
				}
			}
		}

		return void await interaction.reply({ content: "Command Not Found", ephemeral: true });
	}
}
