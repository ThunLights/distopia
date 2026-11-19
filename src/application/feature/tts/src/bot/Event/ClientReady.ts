import type { Client } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

import { restoreSessions } from "../session";

export class ClientReadyEvent extends FeatureEventBase<"clientReady"> {
  public override readonly event = "clientReady";

  public override async handle(client: Client<true>) {
    // Not awaited: rejoining voice channels can take a few seconds per guild and must not hold
    // up other features' clientReady listeners.
    void restoreSessions(client, this.core).catch((error) =>
      console.error("[tts] failed to restore voice sessions", error),
    );
  }
}
