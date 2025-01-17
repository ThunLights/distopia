import { codeBlock } from "$lib/codeblock";

import type { CacheType, Client, InteractionReplyOptions, MessagePayload, UserSelectMenuInteraction } from "discord.js";

export class UsersError {
	constructor(public readonly content: string) {}
}

export abstract class UsersBase {
	public readonly customId: string = "";

	constructor(private readonly client: Client) {}

	async commands(interaction: UserSelectMenuInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | UsersError | null> {
		return new UsersError("Commands Not Found");
	}

	async reply(interaction: UserSelectMenuInteraction<CacheType>): Promise<void | UsersError> {
		const result = await this.commands(interaction);
		if (result === null) {
			return void await interaction.reply({ content: codeBlock(`Error: Commands Not Found`), ephemeral: true });
		}
		if (result instanceof UsersError) {
			return void await interaction.reply({ content: codeBlock(`Error: ${result.content}`), ephemeral: true });
		}
		if (result || typeof result === "string") {
			return void await interaction.reply(result)
		} else {
			return result;
		};
	}
}
