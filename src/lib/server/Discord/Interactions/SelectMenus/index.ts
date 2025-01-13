import { ChannelSelectMenu } from "./Channel/index";

import type { Client } from "discord.js";

export class SelectMenu {
	public readonly channel: ChannelSelectMenu;

	constructor(client: Client) {
		this.channel = new ChannelSelectMenu(client);
	}
}
