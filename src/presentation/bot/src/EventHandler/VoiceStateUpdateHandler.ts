import type { VoiceState } from "discord.js";

import { sendLog } from "../utils/sendLog";
import { BaseHandler } from "./BaseHandler";

export class VoiceStateUpdateHandler extends BaseHandler<
  (oldState: VoiceState, newState: VoiceState) => void
> {
  public override async handle(oldState: VoiceState, newState: VoiceState): Promise<void> {
    if (oldState.channelId === newState.channelId) {
      return;
    }

    const memberId = newState.id;

    if (oldState.channelId) {
      await sendLog(
        this.core,
        newState.guild,
        "logVoiceLeave",
        "ボイスチャンネル退出",
        `<@${memberId}> (${memberId}) が <#${oldState.channelId}> から退出しました。`,
      );
    }

    if (newState.channelId) {
      await sendLog(
        this.core,
        newState.guild,
        "logVoiceJoin",
        "ボイスチャンネル参加",
        `<@${memberId}> (${memberId}) が <#${newState.channelId}> に参加しました。`,
      );
    }
  }
}
