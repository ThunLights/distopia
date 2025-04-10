import { codeBlock } from "$lib/codeblock";
import { MessageFlags } from "discord.js";

import type {
	CacheType,
	ChannelSelectMenuInteraction,
	Client,
	InteractionReplyOptions,
	MessagePayload
} from "discord.js";

export class ChannelsError {
	constructor(public readonly content: string) {}
}

export abstract class ChannelsBase {
	public readonly customId: string = "";

	constructor(private readonly client: Client) {}

	async commands(
		interaction: ChannelSelectMenuInteraction<CacheType>
	): Promise<void | string | MessagePayload | InteractionReplyOptions | ChannelsError | null> {
		return new ChannelsError(`Commands Not Found: ${interaction.customId}`);
	}

	async reply(interaction: ChannelSelectMenuInteraction<CacheType>): Promise<void | ChannelsError> {
		const result = await this.commands(interaction);
		if (result === null) {
			return void (await interaction.reply({
				content: codeBlock(`Error: Commands Not Found`),
				flags: [MessageFlags.Ephemeral]
			}));
		}
		if (result instanceof ChannelsError) {
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
