import { Client, MessageFlags } from "discord.js";

import { CommandsBase, CommandsError } from "./Commands.base";

import type { InteractionReplyOptions, MessagePayload } from "discord.js";

export class HelpCommands extends CommandsBase {
	public readonly commandName = "help";

	constructor(client: Client) {
		super(client);
	}

	async commands(): Promise<
		string | MessagePayload | InteractionReplyOptions | CommandsError | null
	> {
		return {
			content: "https://distopia.top/help",
			flags: [MessageFlags.Ephemeral]
		} satisfies InteractionReplyOptions;
	}
}
