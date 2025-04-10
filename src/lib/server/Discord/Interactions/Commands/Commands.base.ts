import { Client, MessageFlags } from "discord.js";
import { codeBlock } from "$lib/codeblock";

import type {
	CacheType,
	ChatInputCommandInteraction,
	InteractionReplyOptions,
	MessagePayload
} from "discord.js";

export class CommandsError {
	constructor(public readonly content: string) {}
}

export abstract class CommandsBase {
	public readonly commandName: string | null = null;

	constructor(protected readonly client: Client) {}

	async commands(
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void | string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
		return new CommandsError("Commands Not Found");
	}

	async reply(interaction: ChatInputCommandInteraction<CacheType>): Promise<void | CommandsError> {
		const result = await this.commands(interaction);
		if (result === null) {
			return void (await interaction.reply({
				content: codeBlock(`Error: Commands Not Found`),
				flags: [MessageFlags.Ephemeral]
			}));
		}
		if (result instanceof CommandsError) {
			return void (await interaction.reply({
				content: codeBlock(`Error: ${result.content}`),
				flags: [MessageFlags.Ephemeral]
			}));
		}
		if (result || typeof result === "string") {
			return void (await interaction.reply(result));
		} else {
			return result;
		}
	}
}
