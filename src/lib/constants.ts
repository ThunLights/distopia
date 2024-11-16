import cfg from "../../important/discord.json";

type SiteAbout = {
    title: string
    description: string[]
};

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

export const LoginUrl = cfg.oauth;
