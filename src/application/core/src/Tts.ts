import type {
  GuildTtsIgnoreList,
  GuildTtsIgnoreListUpsertInput,
  TtsProvider,
} from "infra-database/types";
import { synthesize as synthesizeSakura } from "infra-sakura";
import {
  DEFAULT_SPEAKER_ID,
  synthesize as synthesizeVoicevox,
  type TtsSynthesisResult,
} from "infra-voicevox";

import type { AppState } from "./AppState";
import { Base } from "./Base";
import type { Guild } from "./Guild";

const DEFAULT_SKIP_COMMAND = "s"; // matches GuildSetting.ttsSkipCommand's DB default
const MAX_READING_LENGTH = 300;
const VOICE_SESSION_KEY_PREFIX = "tts:voice-session:";

export { FAMOUS_SPEAKERS, speakerName } from "infra-voicevox";
export type { TtsSynthesisResult } from "infra-voicevox";
export type { TtsProvider } from "infra-database/types";

// A pointer to which voice/text channel a guild's TTS session is bound to -- not the live
// discord.js voice connection itself (that's process-local, see presentation-bot's
// session.ts), just enough to rejoin after a restart.
export type TtsVoiceSession = {
  guildId: string;
  voiceChannelId: string;
  textChannelId: string;
};

export class Tts extends Base {
  constructor(
    state: AppState,
    private readonly guild: Guild,
  ) {
    super(state);
  }

  public async synthesize(
    text: string,
    speakerId: number,
    guildId: string,
  ): Promise<TtsSynthesisResult> {
    const setting = await this.guild.getSetting(guildId);
    const { sakuraApiKey } = this.state;
    const useSakura = setting?.ttsProvider === "SakuraAi" && !!sakuraApiKey;

    // Cache key includes the provider -- same text/speakerId synthesized by different
    // engines produces different audio (see infra-sakura/synthesize.ts's comment on shared
    // speaker IDs), so they can't share a cache entry.
    const cacheKey = `${useSakura ? "sakura" : "voicevox"}:${speakerId}:${text}`;
    const cached = this.state.memory.ttsSynthesisCache.get(cacheKey);
    if (cached) {
      return { audio: cached.audio };
    }

    const result = useSakura
      ? await synthesizeSakura(text, speakerId, sakuraApiKey as string)
      : await synthesizeVoicevox(text, speakerId, this.state.voicevoxApiKey);

    // Only successful synthesis is cached -- an error (rate limit, timeout, API error) is
    // transient and shouldn't be replayed as a false "no audio" result later.
    if (result.audio) {
      this.state.memory.ttsSynthesisCache.set(cacheKey, {
        audio: result.audio,
        createdAt: new Date(),
      });
    }

    return result;
  }

  public async setTtsProvider(guildId: string, provider: TtsProvider): Promise<void> {
    await this.guild.saveSetting({ guildId, ttsProvider: provider });
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

  public async getSkipCommand(guildId: string): Promise<string> {
    const setting = await this.guild.getSetting(guildId);
    return setting?.ttsSkipCommand ?? DEFAULT_SKIP_COMMAND;
  }

  public async setSkipCommand(guildId: string, command: string): Promise<void> {
    await this.guild.saveSetting({ guildId, ttsSkipCommand: command });
  }

  public async setSkipCodeBlock(guildId: string, enabled: boolean): Promise<void> {
    await this.guild.saveSetting({ guildId, ttsSkipCodeBlock: enabled });
  }

  // Caps how much text reaches synthesis so one long message can't block the read-aloud
  // queue for the whole voice channel. Apply to the text right before synthesis (after
  // dictionary substitution), not to the raw Discord message.
  public truncateForReading(text: string, maxLength: number = MAX_READING_LENGTH): string {
    if (text.length <= maxLength) {
      return text;
    }

    const omitted = text.length - maxLength;
    return `${text.slice(0, maxLength)} 以下${omitted}文字を省略`;
  }

  // If this leaves only whitespace, the caller should skip the message rather than
  // synthesize empty audio.
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

  public async removeIgnore(guildId: string, targetId: string): Promise<GuildTtsIgnoreList | null> {
    const entry = await this.state.database.guildTtsIgnoreList.delete(guildId, targetId);
    this.state.memory.guildTtsIgnoreList.delete(guildId);
    return entry;
  }

  // Called from presentation-bot's session.ts right alongside establishing the live voice
  // connection -- keeps Redis in sync with the in-memory session regardless of which caller
  // (a /tts join, or VoiceStateUpdateHandler's auto-leave) triggers the change.
  public async saveVoiceSession(session: TtsVoiceSession): Promise<void> {
    await this.state.redis.set(
      `${VOICE_SESSION_KEY_PREFIX}${session.guildId}`,
      JSON.stringify(session),
    );
  }

  public async clearVoiceSession(guildId: string): Promise<void> {
    await this.state.redis.del(`${VOICE_SESSION_KEY_PREFIX}${guildId}`);
  }

  // Read once at startup (see presentation-bot's session.ts restoreSessions) to rejoin every
  // guild that was connected before the process restarted. A corrupt entry is skipped rather
  // than thrown -- one bad key shouldn't block every other guild's session from restoring.
  public async getAllVoiceSessions(): Promise<TtsVoiceSession[]> {
    const keys = await this.state.redis.keys(`${VOICE_SESSION_KEY_PREFIX}*`);
    const sessions: TtsVoiceSession[] = [];
    for (const key of keys) {
      const raw = await this.state.redis.get(key);
      if (!raw) {
        continue;
      }
      try {
        sessions.push(JSON.parse(raw) as TtsVoiceSession);
      } catch (error) {
        console.error(`[tts] failed to parse persisted voice session for key ${key}`, error);
      }
    }
    return sessions;
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
