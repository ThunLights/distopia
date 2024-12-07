import { PUBLIC_URL } from "$env/static/public";

type SiteAbout = {
    title: string
    description: string[]
};

type SupporterServer = {
    name: string
    icon: string
    invite: string
}

type Staff = {
    name: string
    icon: string
    description: string
    links: {
        icon: string
        url: string
    }[]
}

export const siteAbout = [
    {
        title: "本サイトについて",
        description: [
            "Discordのサーバーのための掲示板です。",
            "近頃のDiscordサーバー用掲示板は規制が強すぎるという考えから生まれたのが本サイトです。",
            "そのため日本国の法律に違反しなければ基本的にどのようなサーバーでも掲載可能です。",
        ],
    },
    {
        title: "運営元",
        description: [
            "本サイトの運営は<a href=\"https://www.thunlights.com/\">Team ThunLights</a>が行っています。",
            "法人ではなく有志の集まりなので更新頻度には限界がありますが精一杯運営を頑張ろうと思います。",
        ],
    },
    {
        title: "掲示サーバーの削除依頼",
        description: [
            "削除依頼は<a href=\"https://discord.gg/QWUxsxWyYv\">公式Discordサーバー</a>の問い合わせにて受け付けています。",
            "上記以外の場所に削除依頼をしないようにお願いします。",
            "また削除基準に関しては次項をご覧ください",
        ],
    },
    {
        title: "削除基準",
        description: [
            "以下のどちらかに違反している場合削除 (サーバーの登録が抹消) されます。",
            "サーバーで組織単位で日本国の法に反する行為をしている。",
            "不正ツールによりサーバーランキングを上げようとしている。",
        ],
    },
    {
        title: "仕様技術",
        description: [
            "使用言語はTypeScriptです。",
            "使っている主なライブラリは、Express.js, SvelteKit, Prisma Clientです。",
            "現時点では上記の技術での長期運用を考えています。他言語や他フレームワークへの移行はないと思います。",
            "※このサービスをオープンソースにする予定はありません。",
        ]
    },
    {
        title: "問い合わせ",
        description: [
            "問い合わせは<a href=\"https://discord.gg/QWUxsxWyYv\">公式Discordサーバー</a>にて可能です。",
            "上記以外の連絡先への問い合わせはやめてください"
        ]
    },
] satisfies Array<SiteAbout>;

export const supporters = [
    {
        name: "クリームパンと愉快な仲間たち",
        icon: "/supporters/currypan.webp",
        invite: "https://discord.gg/De8T2NS74X",
    },
    {
        name: "Agares",
        icon: "/supporters/agares.webp",
        invite: "https://discord.gg/agares",
    },
    {
        name: "Cappuccino",
        icon: "/supporters/cappuccino.webp",
        invite: "https://discord.gg/cappuccino",
    },
    {
        name: "暇人鯖",
        icon: "/supporters/hima.webp",
        invite: "https://discord.gg/hima",
    },
	{
		name: "大檸檬帝国",
		icon: "/supporters/lemon.webp",
		invite: "https://discord.gg/BgZddsVPMH",
	}
] satisfies Array<SupporterServer>;

export const staffs = [
    {
        name: "ROBOT",
        icon: "/staff/robot.webp",
        description: "Distopiaの代表兼創設者でDistopiaの全てのプログラムを作成",
        links: [
            {
                icon: "/service/github.webp",
                url: "https://github.com/ROBOTofficial",
            },
            {
                icon: "/service/twitter.webp",
                url: "https://twitter.com/AlwaysHarapan",
            },
        ],
    },
    {
        name: "Sumire",
        icon: "/staff/sumire.webp",
        description: "Distopiaのイラスト担当でDistopia内の全てのイラストを作成",
        links: [
            {
                icon: "/service/tiktok.webp",
                url: "https://www.tiktok.com/@sumire_8691",
            },
            {
                icon: "/service/twitter.webp",
                url: "https://twitter.com/sumire_8691",
            },
        ],
    },
	{
		name: "yuzu",
		icon: "/staff/yuzu.webp",
		description: "レベルシステムやアクティブレートなどの数学的アルゴリズムの調整",
		links: [
			{
				icon: "/service/github.webp",
				url: "https://github.com/yuzu-machan",
			}
		],
	},
] satisfies Array<Staff>;

export const LOGIN_URL = PUBLIC_URL;

export const CHARACTER_LIMIT = {
	description: 250,
	tag: 25,
	review: 100,
};

export const TAG_COUNT_LIMIT = 5;

export const INVALID_TAG_CHARACTOR = [
	"\n"
];
