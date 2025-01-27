import { ChannelSelectMenu } from "./Channel/index";
import { RoleSelectMenu } from "./Role/index";
import { UserSelectMenu } from "./User/index";

import type { Client } from "discord.js";

export class SelectMenu {
	public readonly channel: ChannelSelectMenu;
	public readonly user: UserSelectMenu;
	public readonly role: RoleSelectMenu;

	constructor(client: Client) {
		this.channel = new ChannelSelectMenu(client);
		this.user = new UserSelectMenu(client);
		this.role = new RoleSelectMenu(client);
	}
}
