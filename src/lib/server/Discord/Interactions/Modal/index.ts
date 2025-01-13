import { codeBlock } from "$lib/codeblock";

import { RegisterModals } from "./Modal.register";
import { FriendModal } from "./Modal.friend";
import { AutoBanModal } from "./Modal.autoBan";

import type { CacheType, Client, ModalSubmitInteraction } from "discord.js"
import type { ModalsBase } from "./Modal.base"

export class Modals {
    public readonly modals: ModalsBase[]

    constructor(private readonly client: Client) {
        this.modals = [
			new RegisterModals(this.client),
			new FriendModal(this.client),
			new AutoBanModal(this.client),
        ]
    }

    async reply(interaction: ModalSubmitInteraction<CacheType>): Promise<void> {
        for (const command of this.modals) {
            if (command.customId === interaction.customId) {
                const result = await command.reply(interaction);
                if (result) {
                    return void await interaction.reply({ content: codeBlock(`Error: ${result.content}`), ephemeral: true });
                } else {
                    return result;
                }
            }
        }

        return void await interaction.reply({ content: "Command Not Found", ephemeral: true });
    }
}
