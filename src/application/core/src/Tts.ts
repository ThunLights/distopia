import type { GuildTtsIgnoreList, GuildTtsIgnoreListUpsertInput } from "infra-database/types";
import { safeFetch, safeUrl, validateSafeUrl } from "infra-http";

import type { AppState } from "./AppState";
import { Base } from "./Base";
import type { Guild } from "./Guild";

// VOICEVOX TTS Quest -- https://voicevox.su-shiki.com/su-shikiapis/ttsquest/
// No API key required. Synthesis is asynchronous: the initial response only hands back status/
// download URLs, and audioStatusUrl must be polled until isAudioReady before the download URLs
// are actually fetchable.
const DEFAULT_SPEAKER_ID = 1; // fallback matching the API doc's own example
const MAX_SYNTHESIS_RETRIES = 3;
const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 1500;
const MAX_READING_LENGTH = 300;

type SynthesisResponse = {
  success: boolean;
  audioStatusUrl?: string;
  mp3DownloadUrl?: string;
  wavDownloadUrl?: string;
  retryAfter?: number;
};

type AudioStatusResponse = {
  isAudioReady: boolean;
};

export type TtsSynthesisResult =
  | { audio: Buffer; error?: undefined }
  | { audio?: undefined; error: "rate_limited" | "api_error" | "timeout" };

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export class Tts extends Base {
  constructor(
    state: AppState,
    private readonly guild: Guild,
  ) {
    super(state);
  }

  // Free, unauthenticated, shared API -- serialize every synthesis request process-wide so
  // concurrent guilds reading aloud at once don't trip its own rate limit against each other.
  private queue: Promise<unknown> = Promise.resolve();

  private serialize<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queue.then(task, task);
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  public synthesize(text: string, speakerId: number): Promise<TtsSynthesisResult> {
    return this.serialize(() => this.synthesizeNow(text, speakerId));
  }

  private async synthesizeNow(text: string, speakerId: number): Promise<TtsSynthesisResult> {
    // No interpolation here on purpose -- safeUrl encodeURIComponent's every interpolated
    // value, which would mangle the literal URL itself if it were substituted in.
    const url = safeUrl`https://api.tts.quest/v3/voicevox/synthesis`;

    for (let attempt = 0; attempt < MAX_SYNTHESIS_RETRIES; attempt++) {
      const response = await safeFetch(url, {
        method: "POST",
        body: new URLSearchParams({ text, speaker: String(speakerId) }),
      });
      if (response instanceof Error) {
        return { error: "api_error" };
      }

      const body = (await response.json()) as SynthesisResponse;
      if (!body.success) {
        const isLastAttempt = attempt === MAX_SYNTHESIS_RETRIES - 1;
        if (typeof body.retryAfter === "number" && !isLastAttempt) {
          await sleep(body.retryAfter * 1000);
          continue;
        }
        return { error: "rate_limited" };
      }

      const downloadUrl = body.mp3DownloadUrl ?? body.wavDownloadUrl;
      const safeDownloadUrl = downloadUrl ? validateSafeUrl(downloadUrl) : null;
      if (!safeDownloadUrl) {
        return { error: "api_error" };
      }

      const ready = await this.pollUntilReady(body.audioStatusUrl);
      if (!ready) {
        return { error: "timeout" };
      }

      // Fetched here (not left as a URL for the caller to fetch/hand to FFmpeg) so the actual
      // network request always goes through safeFetch's SSRF protections, even though this
      // download host normally comes from the API's own trusted response.
      const audioResponse = await safeFetch(safeDownloadUrl);
      if (audioResponse instanceof Error) {
        return { error: "api_error" };
      }

      return { audio: Buffer.from(await audioResponse.arrayBuffer()) };
    }

    return { error: "rate_limited" };
  }

  private async pollUntilReady(statusUrl: string | undefined): Promise<boolean> {
    if (!statusUrl) {
      return true;
    }

    const safeStatusUrl = validateSafeUrl(statusUrl);
    if (!safeStatusUrl) {
      return false;
    }

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      const response = await safeFetch(safeStatusUrl);
      if (!(response instanceof Error)) {
        const status = (await response.json()) as AudioStatusResponse;
        if (status.isAudioReady) {
          return true;
        }
      }
      await sleep(POLL_INTERVAL_MS);
    }
    return false;
  }

  public async getEffectiveSpeakerId(guildId: string, userId: string): Promise<number> {
    const user = await this.state.database.user.find(userId);
    if (typeof user?.ttsSpeakerId === "number") {
      return user.ttsSpeakerId;
    }

    const setting = await this.guild.getSetting(guildId);
    return setting?.ttsDefaultSpeakerId ?? DEFAULT_SPEAKER_ID;
  }

  public async setUserSpeaker(userId: string, speakerId: number): Promise<void> {
    await this.state.database.user.upsert({ userId, ttsSpeakerId: speakerId });
  }

  public async clearUserSpeaker(userId: string): Promise<void> {
    await this.state.database.user.upsert({ userId, ttsSpeakerId: null });
  }

  public async setGuildDefaultSpeaker(guildId: string, speakerId: number): Promise<void> {
    await this.guild.saveSetting({ guildId, ttsDefaultSpeakerId: speakerId });
  }

  public async getFilterSetting(
    guildId: string,
  ): Promise<{ skipUrl: boolean; skipCodeBlock: boolean }> {
    const setting = await this.guild.getSetting(guildId);
    return {
      skipUrl: setting?.ttsSkipUrl ?? true,
      skipCodeBlock: setting?.ttsSkipCodeBlock ?? true,
    };
  }

  public async setSkipUrl(guildId: string, enabled: boolean): Promise<void> {
    await this.guild.saveSetting({ guildId, ttsSkipUrl: enabled });
  }

  public async setSkipCodeBlock(guildId: string, enabled: boolean): Promise<void> {
    await this.guild.saveSetting({ guildId, ttsSkipCodeBlock: enabled });
  }

  // Caps how much text ever reaches synthesis -- an unbounded wall of text would mean a very
  // long synthesis request and a very long audio clip blocking the queue for everyone else in
  // the voice channel. Applied to the final text right before synthesis (after dictionary
  // substitution), not to the raw Discord message, so it bounds what actually gets read aloud.
  public truncateForReading(text: string, maxLength: number = MAX_READING_LENGTH): string {
    if (text.length <= maxLength) {
      return text;
    }

    const omitted = text.length - maxLength;
    return `${text.slice(0, maxLength)} 以下${omitted}文字を省略`;
  }

  // Strips fenced code blocks and bare URLs before dictionary substitution / synthesis, per
  // the guild's filter settings. Does not attempt partial cleanup of mixed content beyond
  // removing the matched spans -- if that leaves only whitespace, the caller should skip the
  // message entirely rather than synthesize empty/near-empty audio.
  public stripFilteredPatterns(
    text: string,
    setting: { skipUrl: boolean; skipCodeBlock: boolean },
  ): string {
    let result = text;
    if (setting.skipCodeBlock) {
      result = result.replace(/```[\s\S]*?```/g, " ");
    }
    if (setting.skipUrl) {
      result = result.replace(/https?:\/\/\S+/g, " ");
    }
    return result;
  }

  public async getIgnoreList(guildId: string): Promise<GuildTtsIgnoreList[]> {
    const cached = this.state.memory.guildTtsIgnoreList.get(guildId);
    if (cached) {
      return cached.entries;
    }

    const entries = await this.state.database.guildTtsIgnoreList.findAll(guildId);
    this.state.memory.guildTtsIgnoreList.set(guildId, { entries, createdAt: new Date() });
    return entries;
  }

  public async addIgnore(input: GuildTtsIgnoreListUpsertInput): Promise<GuildTtsIgnoreList> {
    const entry = await this.state.database.guildTtsIgnoreList.upsert(input);
    this.state.memory.guildTtsIgnoreList.delete(input.guildId);
    return entry;
  }

  public async removeIgnore(guildId: string, targetId: string): Promise<GuildTtsIgnoreList> {
    const entry = await this.state.database.guildTtsIgnoreList.delete(guildId, targetId);
    this.state.memory.guildTtsIgnoreList.delete(guildId);
    return entry;
  }

  public async shouldSkip(
    guildId: string,
    authorId: string,
    channelId: string,
    isBot: boolean,
  ): Promise<boolean> {
    if (isBot) {
      return true;
    }

    const list = await this.getIgnoreList(guildId);
    return list.some(
      (entry) =>
        (entry.idType === "UserId" && entry.targetId === authorId) ||
        (entry.idType === "ChannelId" && entry.targetId === channelId),
    );
  }
}
