import { Guild } from "./Controller.guild";
import { User } from "./Controller.user";

import type { Client } from "discord.js";

export class Controller {
	public readonly guild: Guild;
	public readonly user: User;

	constructor(private readonly client: Client) {
		this.guild = new Guild(this.client);
		this.user = new User(this.client);
	}
}
