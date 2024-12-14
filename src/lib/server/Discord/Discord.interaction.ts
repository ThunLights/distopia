import type { CacheType, Client, Interaction } from "discord.js";
import { InteractionResponse } from "./Interactions/index";
import { CATEGORIES } from "../../category.svelte";

type Choice = {
	name: string
	value: string
}

type Choices = Array<Choice>

export type InteractionCommand = {
    name: string
    description: string
    options?: {
        type: number
        name: string
        description: string
        required?: boolean
        channel_types?: number[]
		choices?: Choices
        options?: {
            type: number
            name: string
            description: string
            required?: boolean
            channel_types?: number[]
			choices?: Choices
            options?: {
                type: number
                name: string
                description: string
                required?: boolean
                channel_types?: number[]
				choices?: Choices
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
					type: 1,
					name: "ranking",
					description: "put ranking panel",
				}
			],
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
			name: "register",
			description: "【期間限定】コマンドのみでDistopiaに本登録できます。(オーナーのみ)",
			options: [
				{
					type: 3,
					name: "category",
					required: true,
					description: "サーバーカテゴリを選択",
					choices: CATEGORIES.map(value => {return {
						name: value.name,
						value: value.id,
					}}),
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

    public async create(interaction: Interaction<CacheType>): Promise<void> {
        return void await this.interactionRespnse.reply(interaction);
    }
}
