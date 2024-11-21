import type { CacheType, Client, Interaction } from "discord.js";

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
        },
        {
            name: "web",
            description: "web",
            options: [
                {
                    type: 1,
                    name: "register",
                    description: "サーバーを登録する。",
                },
                {
                    type: 1,
                    name: "invite",
                    description: "招待リンクをこのチャンネルに変える。",
                },
                {
                    type: 1,
                    name: "invite",
                    description: "このサーバーのページを閲覧",
                }
            ],
        },
        {
            name: "bump",
            description: "サーバーの表示順を上げる",
        },
        {
            name: "help",
            description: "ヘルプを表示",
        },
        {
            name: "staff",
            description: "スタッフかどうかチェックできるよ",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "ユーザーを指定することも出来ます。",
                    required: false,
                }
            ],
        }
    ];

    constructor(private readonly client: Client) {
    }

    public async interactionCreate(interaction: Interaction<CacheType>): Promise<void> {
        if (interaction.isContextMenuCommand()) {
            return void await interaction.reply({ content: "Err", ephemeral: true })
        }
        if (interaction.isCommand()) {
            if (interaction.commandName === "admin") {
                const group = interaction.options.getSubcommandGroup(true);
                if (group === "permission") {
//                    const commandName = interaction.options.getSubcommand();
//                    if (commandName === "add") {}
//                    if (commandName === "remove") {}
                    return void await interaction.reply({ content: "このコマンドは準備中です。", ephemeral: true });
                }
            }
        }
    }
}
