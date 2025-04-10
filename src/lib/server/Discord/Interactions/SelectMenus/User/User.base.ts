import { codeBlock } from "$lib/codeblock";
import { MessageFlags } from "discord.js";

import type {
	CacheType,
	Client,
	InteractionReplyOptions,
	MessagePayload,
	UserSelectMenuInteraction
} from "discord.js";

export class UsersError {
	constructor(public readonly content: string) {}
}

export abstract class UsersBase {
	public readonly customId: string = "";

	constructor(private readonly client: Client) {}

	async commands(
		interaction: UserSelectMenuInteraction<CacheType>
	): Promise<void | string | MessagePayload | InteractionReplyOptions | UsersError | null> {
		return new UsersError(`Commands Not Found: ${interaction.customId}`);
	}

	async reply(interaction: UserSelectMenuInteraction<CacheType>): Promise<void | UsersError> {
		const result = await this.commands(interaction);
		if (result === null) {
			return void (await interaction.reply({
				content: codeBlock(`Error: Commands Not Found`),
				flags: [MessageFlags.Ephemeral]
			}));
		}
		if (result instanceof UsersError) {
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
