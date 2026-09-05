import type { Message, OmitPartialGroupDMChannel } from "discord.js";

import { detectSpamMessage } from "../utils/moderation/spamDetector";
import { enqueue, getSession } from "../utils/tts/session";
import { BaseHandler } from "./BaseHandler";

export class MessageCreateHandler extends BaseHandler<
  (message: OmitPartialGroupDMChannel<Message<boolean>>) => void
> {
  public override async handle(
    message: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<void> {
    const isDetected = await detectSpamMessage(this.core, this.logger, message);

    if (isDetected) {
      return;
    }

    if (message.guildId && message.member?.id) {
      await this.core.message.increase(message.guildId, message.member.id, message.content);
    }

    if (message.guildId) {
      await this.readAloud(message.guildId, message);
    }
  }

  private async readAloud(
    guildId: string,
    message: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<void> {
    const session = getSession(guildId);
    if (!session || session.textChannelId !== message.channelId) {
      return;
    }

    const skip = await this.core.tts.shouldSkip(
      guildId,
      message.author.id,
      message.channelId,
      message.author.bot,
    );
    if (skip) {
      return;
    }

    const filterSetting = await this.core.tts.getFilterSetting(guildId);
    const filtered = this.core.tts.stripFilteredPatterns(message.content, filterSetting);
    if (filtered.trim() === "") {
      return;
    }

    const dictionary = await this.core.dictionary.resolve(guildId, message.author.id);
    const substituted = this.core.dictionary.substitute(filtered, dictionary);
    const text = this.core.tts.truncateForReading(substituted);
    const speakerId = await this.core.tts.getEffectiveSpeakerId(guildId, message.author.id);

    enqueue(guildId, text, speakerId, (word, speaker) => this.core.tts.synthesize(word, speaker));
  }
}
