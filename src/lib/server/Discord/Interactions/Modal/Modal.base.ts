import { codeBlock } from "$lib/codeblock";
import { MessageFlags } from "discord.js";

import type {
	CacheType,
	Client,
	InteractionReplyOptions,
	MessagePayload,
	ModalSubmitInteraction
} from "discord.js";

export class ModalsError {
	constructor(public readonly content: string) {}
}

export abstract class ModalsBase {
	public readonly customId: string | null = null;

	constructor(private readonly client: Client) {}

	async commands(
		interaction: ModalSubmitInteraction<CacheType>
	): Promise<
		(InteractionReplyOptions & { fetchReply: true }) | string | MessagePayload | ModalsError | null
	> {
		return new ModalsError("Commands Not Found");
	}

	async reply(interaction: ModalSubmitInteraction<CacheType>): Promise<void | ModalsError> {
		const result = await this.commands(interaction);
		if (result === null) {
			return void (await interaction.reply({
				content: codeBlock(`Error: Commands Not Found`),
				flags: [MessageFlags.Ephemeral]
			}));
		}
		if (result instanceof ModalsError) {
			return void (await interaction.reply({
				content: codeBlock(`Error: ${result.content}`),
				flags: [MessageFlags.Ephemeral]
			}));
		}
		return void (await interaction.reply(result));
	}
}
