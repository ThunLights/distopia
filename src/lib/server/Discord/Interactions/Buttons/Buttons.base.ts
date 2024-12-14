import { codeBlock } from "$lib/codeblock";

import type { ButtonInteraction, CacheType, Client, InteractionReplyOptions, MessagePayload } from "discord.js";

export class ButtonsError {
    constructor(public readonly content: string) {}
}

export abstract class ButtonsBase {
	public readonly customId: string = "";
	constructor(private readonly client: Client) {}

	async commands(interaction: ButtonInteraction<CacheType>): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		return new ButtonsError("Commands Not Found");
	}

	async reply(interaction: ButtonInteraction<CacheType>): Promise<void | ButtonsError> {
		const result = await this.commands(interaction);
		if (result === null) {
			return void await interaction.reply({ content: codeBlock(`Error: Commands Not Found`), ephemeral: true });
		}
		if (result instanceof ButtonsError) {
			return void await interaction.reply({ content: codeBlock(`Error: ${result.content}`), ephemeral: true });
		}
		if (result || typeof result === "string") {
			return void await interaction.reply(result)
		} else {
			return result;
		};
	}
}
