import { Client } from "discord.js";

import { Commands } from "./Commands/index";
import { Modals } from "./Modal/index";
import { Buttons } from "./Buttons/index";
import { SelectMenu } from "./SelectMenus/index";

import type { CacheType, Interaction } from "discord.js";

export class InteractionResponse {
    public readonly commands: Commands
	public readonly modals: Modals
	public readonly buttons: Buttons
	public readonly selectMenu: SelectMenu;

    constructor(private readonly client: Client) {
        this.commands = new Commands(this.client);
		this.modals = new Modals(this.client);
		this.buttons = new Buttons(this.client);
		this.selectMenu = new SelectMenu(this.client);
    }

    async reply(interaction: Interaction<CacheType>): Promise<void> {
        if (interaction.isContextMenuCommand()) {
            return;
        }
		if (interaction.isChannelSelectMenu()) {
			return await this.selectMenu.channel.reply(interaction);
		}
		if (interaction.isUserSelectMenu()) {
			return await this.selectMenu.user.reply(interaction);
		}
		if (interaction.isButton()) {
			return await this.buttons.reply(interaction);
		}
        if (interaction.isCommand()) {
            return await this.commands.reply(interaction);
        }
		if (interaction.isModalSubmit()) {
			return await this.modals.reply(interaction);
		}
    }
}
