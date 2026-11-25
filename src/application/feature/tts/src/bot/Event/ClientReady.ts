import type { Client } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

import { takeOverVoiceSessions } from "../handover";
import { releaseAll, restoreSessions } from "../session";

export class ClientReadyEvent extends FeatureEventBase<"clientReady"> {
  public override readonly event = "clientReady";

  public override async handle(client: Client<true>) {
    // Not awaited: rejoining voice channels can take a few seconds per guild and must not hold
    // up other features' clientReady listeners.
    void this.rejoin(client).catch((error) =>
      console.error("[tts] failed to restore voice sessions", error),
    );
  }

  private async rejoin(client: Client<true>) {
    const { REDIS_URL } = process.env;
    try {
      if (REDIS_URL) {
        await takeOverVoiceSessions(this.core, REDIS_URL, releaseAll);
      }
    } catch (error) {
      // Rejoining anyway only risks the old takeover fight, which is better than staying silent.
      console.error("[tts] voice handover failed", error);
    }
    await restoreSessions(client, this.core);
  }
}
