import { codeBlock } from "$lib/codeblock";
import { MessageFlags } from "discord.js";

import type {
	CacheType,
	Client,
	InteractionReplyOptions,
	MessagePayload,
	RoleSelectMenuInteraction
} from "discord.js";

export class RolesError {
	constructor(public readonly content: string) {}
}

export abstract class RolesBase {
	public readonly customId: string = "";

	constructor(private readonly client: Client) {}

	async commands(
		interaction: RoleSelectMenuInteraction<CacheType>
	): Promise<void | string | MessagePayload | InteractionReplyOptions | RolesError | null> {
		return new RolesError("Commands Not Found");
	}

	async reply(interaction: RoleSelectMenuInteraction<CacheType>): Promise<void | RolesError> {
		const result = await this.commands(interaction);
		if (result === null) {
			return void (await interaction.reply({
				content: codeBlock(`Error: Commands Not Found`),
				flags: [MessageFlags.Ephemeral]
			}));
		}
		if (result instanceof RolesError) {
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
