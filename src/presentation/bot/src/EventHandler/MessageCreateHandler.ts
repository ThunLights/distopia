import type { Message, OmitPartialGroupDMChannel } from "discord.js";

import { detectSpamMessage } from "../utils/moderation/spamDetector";
import { enqueue, getSession, skip as skipCurrentPlayback } from "../utils/tts/session";
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
      try {
        await this.readAloud(message.guildId, message);
      } catch (error) {
        // A TTS-side failure (DB lookup, dictionary resolution, etc.) must not reject this
        // handler -- the messageCreate listener has no catch, so an uncaught rejection here
        // would only surface as an unlogged-context unhandledRejection at the process level.
        console.error("[tts] failed to process message for read-aloud", error);
      }
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

    // A plain chat message matching the guild's configured skip word (default "s"), not a
    // slash command -- lets anyone interrupt whatever's currently being read without waiting
    // for it to finish. Checked before the ignore-list/filter pipeline below since it's a
    // playback control action, not content to be read aloud.
    if (!message.author.bot) {
      const skipCommand = await this.core.tts.getSkipCommand(guildId);
      if (message.content.trim().toLowerCase() === skipCommand.toLowerCase()) {
        skipCurrentPlayback(guildId);
        return;
      }
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

    let text: string;
    if (filtered.trim() === "") {
      // No text left to read -- normally means "skip", but a message that's only image/video
      // attachment(s) (no caption at all) still deserves an announcement so listeners know
      // something was posted, instead of silent gaps whenever someone shares a picture.
      if (
        !isMediaOnlyMessage(
          message.content,
          message.attachments.map((attachment) => attachment.contentType),
        )
      ) {
        return;
      }
      text = "画像が送信されました";
    } else {
      const dictionary = await this.core.dictionary.resolve(guildId, message.author.id);
      const substituted = this.core.dictionary.substitute(filtered, dictionary);
      text = this.core.tts.truncateForReading(substituted);
    }

    // Prepended after truncation, not before -- it's short and always the same shape, so it
    // should never itself be the thing that gets cut off, and the omission note on a long
    // message still reflects just that message's own length.
    const replyPrefix = await this.resolveReplyPrefix(message);

    const speakerId = await this.core.tts.getEffectiveSpeakerId(guildId, message.author.id);

    enqueue(guildId, message.channelId, `${replyPrefix}${text}`, speakerId, (word, speaker) =>
      this.core.tts.synthesize(word, speaker, guildId),
    );
  }

  private async resolveReplyPrefix(
    message: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<string> {
    const repliedUser = message.mentions.repliedUser;
    if (!repliedUser) {
      return "";
    }

    // Prefer the guild-specific nickname (GuildMember.displayName) over the account's own
    // display name -- falls back to the latter if the member already left the server.
    const repliedMember = await message.guild?.members.fetch(repliedUser.id).catch(() => null);
    const displayName = repliedMember?.displayName ?? repliedUser.displayName;
    return `${displayName}のメッセージに返信しました。`;
  }
}

// True only when the message has no caption at all -- checked against the raw content, not
// the filtered text readAloud reads. A caption stripFilteredPatterns would remove entirely
// (e.g. a bare URL with skipUrl on) still counts as "had a caption": that message is skipped
// silently like any other fully-filtered text, not announced as captionless.
export function isMediaOnlyMessage(
  rawContent: string,
  attachmentContentTypes: (string | null)[],
): boolean {
  if (rawContent.trim() !== "" || attachmentContentTypes.length === 0) {
    return false;
  }

  return attachmentContentTypes.every(
    (contentType) => contentType?.startsWith("image/") || contentType?.startsWith("video/"),
  );
}
