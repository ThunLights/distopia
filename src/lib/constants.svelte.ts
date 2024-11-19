
type SiteAbout = {
    title: string
    description: string[]
};

type SupporterServer = {
    name: string
    icon: string
    invite: string
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
        name: "はげさば",
        icon: "/supporters/hage.webp",
        invite: "https://discord.gg/hage",
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
    }
] satisfies Array<SupporterServer>;

export const LOGIN_URL = "https://discord.com/oauth2/authorize?client_id=1300797373374529557&response_type=code&redirect_uri=https%3A%2F%2Fdistopia.top%2Fauth&scope=email+guilds.join+identify+guilds";
