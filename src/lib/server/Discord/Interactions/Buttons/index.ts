import { codeBlock } from "$lib/codeblock";

import { RankingRateButton } from "./Buttons.rankingRate";
import { RankingLevelButton } from "./Buttons.rankingLevel";
import { BumpNoticeButton } from "./Buttons.bumpNotice";
import { AutoBanButton } from "./Buttons.autoBan";
import { NoticeChannelButton } from "./Buttons.noticeChannel";
import { BumpNoticeOnButton } from "./Buttons.bumpNoticeOn";
import { BumpNoticeOffButton } from "./Buttons.bumpNoticeOff";

import type { ButtonInteraction, CacheType, Client } from "discord.js";
import type { ButtonsBase } from "./Buttons.base";

export class Buttons {
	public readonly buttons: ButtonsBase[]

	constructor(private readonly client: Client) {
		this.buttons = [
			new RankingRateButton(this.client),
			new RankingLevelButton(this.client),
			new BumpNoticeButton(this.client),
			new AutoBanButton(this.client),
			new NoticeChannelButton(this.client),
			new BumpNoticeOnButton(this.client),
			new BumpNoticeOffButton(this.client),
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
