import { codeBlock } from "$lib/codeblock";
import { MessageFlags } from "discord.js";

import { FriendModal } from "./Modal.friend";
import { AutoBanModal } from "./Modal.autoBan";
import { BumpNoticeContent } from "./Modal.bumpNoticeContent";

import type { CacheType, Client, ModalSubmitInteraction } from "discord.js"
import type { ModalsBase } from "./Modal.base"

export class Modals {
    public readonly modals: ModalsBase[]

    constructor(private readonly client: Client) {
        this.modals = [
			new FriendModal(this.client),
			new AutoBanModal(this.client),
			new BumpNoticeContent(this.client),
        ]
    }

    async reply(interaction: ModalSubmitInteraction<CacheType>): Promise<void> {
        for (const command of this.modals) {
            if (command.customId === interaction.customId) {
                const result = await command.reply(interaction);
                if (result) {
                    return void await interaction.reply({ content: codeBlock(`Error: ${result.content}`), flags: [ MessageFlags.Ephemeral ] });
                } else {
                    return result;
                }
            }
        }

        return void await interaction.reply({ content: "Command Not Found", flags: [ MessageFlags.Ephemeral ] });
    }
}
