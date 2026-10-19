import { fileURLToPath } from "node:url";

import { buildBotInviteUrl } from "infra-discord/oauth-url";
import { defineConfig, loadEnv } from "vitepress";

// Reads the repo-root .env when present (local/devcontainer); real env vars win, so CI needs no file.
const repoRoot = fileURLToPath(new URL("../../../../..", import.meta.url));
const botId = loadEnv("", repoRoot, "PUBLIC_").PUBLIC_BOT_ID;
if (!botId) {
  throw new Error("PUBLIC_BOT_ID is required to build the bot invite link");
}

const botInviteLink = buildBotInviteUrl(botId);

export default defineConfig({
  lang: "ja",
  title: "Distopia Help",
  description: "Discordサーバー用掲示板 Distopia のヘルプ",
  cleanUrls: true,
  head: [["link", { rel: "icon", href: "/favicon.ico", sizes: "any" }]],
  sitemap: { hostname: "https://docs.distopia.top" },
  themeConfig: {
    logo: "/logo.webp",
    nav: [
      { text: "はじめに", link: "/register" },
      { text: "コマンド一覧", link: "/commands" },
      { text: "Distopia", link: "https://distopia.top" },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/ThunLights/distopia" }],
    search: {
      provider: "local",
      options: {
        translations: {
          button: { buttonText: "検索", buttonAriaLabel: "検索" },
          modal: {
            displayDetails: "詳細を表示",
            resetButtonTitle: "リセット",
            backButtonTitle: "戻る",
            noResultsText: "結果が見つかりません",
            footer: {
              selectText: "選択",
              selectKeyAriaLabel: "Enter",
              navigateText: "移動",
              navigateUpKeyAriaLabel: "上矢印",
              navigateDownKeyAriaLabel: "下矢印",
              closeText: "閉じる",
              closeKeyAriaLabel: "Esc",
            },
          },
        },
      },
    },
    outline: { label: "このページの内容" },
    docFooter: { prev: "前のページ", next: "次のページ" },
    sidebarMenuLabel: "メニュー",
    returnToTopLabel: "トップへ戻る",
    darkModeSwitchLabel: "外観",
    editLink: {
      pattern: "https://github.com/ThunLights/distopia/edit/main/src/presentation/help/docs/:path",
      text: "このページを編集",
    },
    sidebar: [
      {
        text: "はじめに",
        items: [
          { text: "サーバー登録の仕方", link: "/register" },
          { text: "アクティブレートとは", link: "/rate" },
          { text: "コマンド一覧", link: "/commands" },
        ],
      },
      {
        text: "機能",
        items: [
          { text: "Bump", link: "/bump" },
          { text: "サーバー設定", link: "/settings" },
          { text: "メンバー認証", link: "/verify" },
          { text: "読み上げ (TTS)", link: "/tts" },
          { text: "ブラックリスト", link: "/blacklist" },
          { text: "レビュー", link: "/review" },
        ],
      },
    ],
  },
  vite: {
    plugins: [
      {
        name: "bot-invite-link",
        enforce: "pre",
        transform: (code, id) =>
          id.endsWith(".md") ? code.replaceAll("BOT_INVITE_LINK", botInviteLink) : null,
      },
    ],
  },
});
