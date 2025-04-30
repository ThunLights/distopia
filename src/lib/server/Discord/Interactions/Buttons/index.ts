import { codeBlock } from "$lib/codeblock";

import { RankingRateButton } from "./Buttons.rankingRate";
import { RankingLevelButton } from "./Buttons.rankingLevel";
import { BumpNoticeButton } from "./Buttons.bumpNotice";
import { AutoBanButton } from "./Buttons.autoBan";
import { NoticeChannelButton } from "./Buttons.noticeChannel";
import { BumpNoticeOnButton } from "./Buttons.bumpNoticeOn";
import { BumpNoticeOffButton } from "./Buttons.bumpNoticeOff";
import { ActingOwnerButton } from "./Buttons.actingOwner";
import { ActingOwnerCancelButton } from "./Buttons.actingOwnerCancel";
import { AutoBanSetButton } from "./Buttons.autoBanSet";
import { AutoBanCancelButton } from "./Buttons.autoBanCancel";
import { MessageFlags } from "discord.js";
import { BumpRoleButton } from "./Buttons.bumpRole";
import { BumpRoleCancelButton } from "./Buttons.bumpRoleCancel";
import { RankingUserBumpButton } from "./Buttons.rankingUserBump";
import { BumpNoticeContentButton } from "./Buttons.bumpNoticeContent";
import { BumpNoticeContentSetButton } from "./Buttons.bumpNoticeContentSet";
import { BumpNoticeContentCancelButton } from "./Buttons.bumpNoticeContentCancel";

import type { ButtonInteraction, CacheType, Client } from "discord.js";
import type { ButtonsBase } from "./Buttons.base";

export class Buttons {
	public readonly buttons: ButtonsBase[];

	constructor(private readonly client: Client) {
		this.buttons = [
			new RankingRateButton(this.client),
			new RankingLevelButton(this.client),
			new RankingUserBumpButton(this.client),
			new BumpNoticeButton(this.client),
			new AutoBanButton(this.client),
			new AutoBanSetButton(this.client),
			new AutoBanCancelButton(this.client),
			new NoticeChannelButton(this.client),
			new BumpNoticeOnButton(this.client),
			new BumpNoticeOffButton(this.client),
			new ActingOwnerButton(this.client),
			new ActingOwnerCancelButton(this.client),
			new BumpRoleButton(this.client),
			new BumpRoleCancelButton(this.client),
			new BumpNoticeContentButton(this.client),
			new BumpNoticeContentSetButton(this.client),
			new BumpNoticeContentCancelButton(this.client)
		];
	}
	async reply(interaction: ButtonInteraction<CacheType>): Promise<void> {
		for (const button of this.buttons) {
			if (button.customId === interaction.customId) {
				const result = await button.reply(interaction);
				if (result) {
					return void (await interaction.reply({
						content: codeBlock(`Error: ${result.content}`),
						flags: [MessageFlags.Ephemeral]
					}));
				} else {
					return result;
				}
			}
		}

		return void (await interaction.reply({
			content: "Command Not Found",
			flags: [MessageFlags.Ephemeral]
		}));
	}
}
