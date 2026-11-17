import type { Client } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

import { restoreBumpNotices } from "../notice";

export class ClientReadyEvent extends FeatureEventBase<"clientReady"> {
  public override readonly event = "clientReady";

  public override async handle(client: Client<true>) {
    await restoreBumpNotices(client, this.core);
  }
}
