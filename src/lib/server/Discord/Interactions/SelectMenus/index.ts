import { ChannelSelectMenu } from "./Channel/index";
import { UserSelectMenu } from "./User/index";

import type { Client } from "discord.js";

export class SelectMenu {
	public readonly channel: ChannelSelectMenu;
	public readonly user: UserSelectMenu;

	constructor(client: Client) {
		this.channel = new ChannelSelectMenu(client);
		this.user = new UserSelectMenu(client);
	}
}
