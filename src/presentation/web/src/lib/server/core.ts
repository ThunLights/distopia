import { PUBLIC_OWNER_ID, PUBLIC_URL } from "$env/static/public";
import { djsController } from "./bot";
import { database } from "./database";
import { memory } from "./memory";
import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";
import { page as levelRatePage } from "presentation-bot/page/Ranking/Level";
import { page as activeRatePage } from "presentation-bot/page/Ranking/Rate";
import { page as userBumpPage } from "presentation-bot/page/Ranking/UserBump";

export function genCore(state: AppState) {
  return new AppCore(state);
}

export const core = genCore({
  owner: { id: PUBLIC_OWNER_ID },
  url: PUBLIC_URL,
  memory,
  discord: djsController,
  database,
});

export async function updatePanels() {
  for (const panel of await core.panel.findAll()) {
    const content =
      panel.type === "ActiveRateRanking"
        ? await activeRatePage(core)
        : panel.type === "LevelRanking"
          ? await levelRatePage(core)
          : await userBumpPage(core);
    await djsController.message.edit(panel.channelId, panel.messageId, { embeds: content.embeds });
  }
}
