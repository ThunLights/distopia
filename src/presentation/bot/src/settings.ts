import { features } from "app-feature-loader/bot";
import { addSettings } from "presentation-bot-kit/settings";

import { actingOwnerPage } from "./EventHandler/InteractionCreateHandler/Page/ActingOwnerPage";
import { bumpPage } from "./EventHandler/InteractionCreateHandler/Page/BumpPage";
import { logPage } from "./EventHandler/InteractionCreateHandler/Page/LogPage";
import { stickyMessagePage } from "./EventHandler/InteractionCreateHandler/Page/StickyMessagePage";
import { welcomeMessagePage } from "./EventHandler/InteractionCreateHandler/Page/WelcomeMessagePage";

export function registerSettings() {
  addSettings(
    {
      label: "代理オーナー設定",
      value: "actingOwner",
      page: actingOwnerPage,
      fields: async (core, guild) => {
        const settings = await core.guild.getSetting(guild.id);
        return [
          {
            name: "オーナー代理",
            value: settings?.actingOwner ? `<@${settings.actingOwner}>` : "未設定",
          },
        ];
      },
    },
    {
      label: "Bump設定",
      value: "bump",
      page: bumpPage,
      fields: async (core, guild) => {
        const settings = await core.guild.getSetting(guild.id);
        return [
          { name: "Bump通知", value: settings?.bumpNotice ? "有効" : "無効" },
          {
            name: "Bump通知用ロール",
            value: settings?.bumpNoticeRole ? `<@&${settings.bumpNoticeRole}>` : "未設定",
          },
          { name: "Bump通知内容", value: settings?.bumpNoticeContent ?? "未設定" },
        ];
      },
    },
    { label: "入退出メッセージ設定", value: "welcomeMessage", page: welcomeMessagePage },
    { label: "ログ設定", value: "log", page: logPage },
    { label: "ピン止めメッセージ設定", value: "stickyMessage", page: stickyMessagePage },
    ...features.flatMap((feature) => feature.settings ?? []),
  );
}
