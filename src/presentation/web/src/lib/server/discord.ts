import { BOT_ID, BOT_REDIRECT_URL, BOT_SECRET, BOT_TOKEN } from "$env/static/private";
import { core } from "./core";
import { Controller, genClient } from "infra-discord";
import { handleClient } from "presentation-bot";
import { page as levelRatePage } from "presentation-bot/page/Ranking/Level";
import { page as activeRatePage } from "presentation-bot/page/Ranking/Rate";
import { page as userBumpPage } from "presentation-bot/page/Ranking/UserBump";

export const client = handleClient(genClient(), core);

export const controller = new Controller(client, {
  id: BOT_ID,
  secret: BOT_SECRET,
  url: BOT_REDIRECT_URL,
  token: BOT_TOKEN,
});

export async function updatePanels() {
  for (const panel of await core.panel.findAll()) {
    const content =
      panel.type === "ActiveRateRanking"
        ? await activeRatePage(core)
        : panel.type === "LevelRanking"
          ? await levelRatePage(core)
          : await userBumpPage(core);
    await controller.message.edit(panel.channelId, panel.messageId, { embeds: content.embeds });
  }
}
