import type { VoiceState } from "discord.js";

import { emitFeatureEvent } from "../featureEvents";
import { BaseHandler } from "./BaseHandler";

export class VoiceStateUpdateHandler extends BaseHandler<
  (oldState: VoiceState, newState: VoiceState) => void
> {
  public override async handle(oldState: VoiceState, newState: VoiceState): Promise<void> {
    if (oldState.channelId === newState.channelId) {
      return;
    }

    await emitFeatureEvent(this.core, "voiceStateUpdate", oldState, newState);
  }
}
