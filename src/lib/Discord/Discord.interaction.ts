import type { CacheType, Interaction } from "discord.js";

export type InteractionCommand = {
    name: string
    description: string
    options?: {
        type: number
        name: string
        description: string
        required?: boolean
        channel_types?: number[]
        options?: {
            type: number
            name: string
            description: string
            required?: boolean
            channel_types?: number[]
            options?: {
                type: number
                name: string
                description: string
                required?: boolean
                channel_types?: number[]
            }[]
        }[]
    }[]
};

export type InteractionCommands = Array<InteractionCommand>;

export class InteractionClient {
    public static commands: InteractionCommands = [
        {
            name: "admin",
            description: "only admin",
            options: [
                {
                    type: 2,
                    name: "permission",
                    description: "edit users permission",
                    options: [
                        {
                            type: 1,
                            name: "add",
                            description: "権限追加",
                        },
                        {
                            type: 1,
                            name: "remove",
                            description: "権限削除",
                        }
                    ]
                }
            ]
        }
    ];

    constructor() {}

    public async interactionCreate(interaction: Interaction<CacheType>): Promise<void> {
        if (interaction.isContextMenuCommand()) {
            return void await interaction.reply({ content: "Err", ephemeral: true })
        }
        if (interaction.isCommand()) {
            if (interaction.commandName === "admin") {
                const group = interaction.options.getSubcommandGroup(true);
                if (group === "permission") {
                    const commandName = interaction.options.getSubcommand();
                }
            }
        }
    }
}
