import { Client, EmbedBuilder } from "discord.js";

import { Guild } from "../../Controller/Controller.guild";
import { CommandsBase, CommandsError } from "./Commands.base";

import type { CacheType, InteractionReplyOptions, ChatInputCommandInteraction, MessagePayload } from "discord.js";
export class StaffCommands extends CommandsBase {
    public readonly commandName = "staff";

    constructor(client: Client) {
        super(client);
    }

    async commands(interaction: ChatInputCommandInteraction<CacheType>): Promise<string | MessagePayload | InteractionReplyOptions | CommandsError | null> {
        const user = interaction.options.getUser("user");
        const id = user ? user.id : interaction.user.id;
        if (!(await Guild.isStaff(id, this.client))) {
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("No Staff")
                .setDescription(`<@!${id}> はスタッフではありません`);
            return { embeds: [ embed ] } satisfies InteractionReplyOptions;
        }
        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("Staff")
            .setDescription(`<@!${id}> はスタッフです。`);
        return { embeds: [ embed ] } satisfies InteractionReplyOptions;
    }
}
