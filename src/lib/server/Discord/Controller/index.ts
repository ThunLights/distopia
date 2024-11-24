import type { Client } from "discord.js";
import { Guild } from "./Controller.guild";

export class Controller {
	public readonly guild: Guild;

	constructor(private readonly client: Client) {
		this.guild = new Guild(this.client);
	}
}
