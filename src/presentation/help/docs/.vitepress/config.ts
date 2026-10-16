import { buildBotInviteUrl } from "infra-discord/oauth-url";
import { defineConfig } from "vitepress";

const botId = process.env.PUBLIC_BOT_ID;
if (!botId) {
  throw new Error("PUBLIC_BOT_ID is required to build the bot invite link");
}

const botInviteLink = buildBotInviteUrl(botId);

export default defineConfig({
  lang: "ja",
  title: "Distopia Help",
  description: "Discordサーバー用掲示板 Distopia のヘルプ",
  cleanUrls: true,
  sitemap: { hostname: "https://docs.distopia.top" },
  themeConfig: {
    nav: [{ text: "Distopia", link: "https://distopia.top" }],
    sidebar: [
      { text: "目次", link: "/" },
      { text: "サーバー登録の仕方", link: "/register" },
      { text: "アクティブレートとは", link: "/rate" },
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
