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

export { FAMOUS_SPEAKERS, speakerName } from "infra-voicevox";
export type { TtsSynthesisResult } from "infra-voicevox";
export type { TtsProvider } from "infra-database/types";

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
    if (setting?.ttsProvider === "SakuraAi" && sakuraApiKey) {
      return synthesizeSakura(text, speakerId, sakuraApiKey);
    }

    return synthesizeVoicevox(text, speakerId, this.state.voicevoxApiKey);
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
