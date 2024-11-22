import type { CacheType, Client, Interaction } from "discord.js";
import { InteractionResponse } from "./Interactions/index";

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
        },
        {
            name: "web",
            description: "web",
            options: [
                {
                    type: 1,
                    name: "register",
                    description: "サーバーの仮登録をする。",
                },
                {
                    type: 1,
                    name: "invite",
                    description: "招待リンクをこのチャンネルに変える。",
                },
                {
                    type: 1,
                    name: "page",
                    description: "このサーバーのページを表示",
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
        },
    ];
    public readonly interactionRespnse: InteractionResponse;

    constructor(private readonly client: Client) {
        this.interactionRespnse = new InteractionResponse(this.client);
    }

    public async interactionCreate(interaction: Interaction<CacheType>): Promise<void> {
        return void await this.interactionRespnse.reply(interaction);
    }
}
