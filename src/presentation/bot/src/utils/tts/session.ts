import { Readable } from "node:stream";

import {
  type AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  StreamType,
  type VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import type { VoiceBasedChannel } from "discord.js";

// Process-local, in-memory only -- these hold live discord.js voice objects tied to this
// process's WebSocket/UDP connections, which can't survive (or be meaningfully persisted
// across) a restart. Kept here rather than in the shared `repo-memory` package since that
// package is consumed by both the bot and the web app, and has no reason to depend on
// discord.js voice types.
type TtsSession = {
  voiceChannelId: string;
  textChannelId: string;
  connection: VoiceConnection;
  player: AudioPlayer;
  queue: { text: string; speakerId: number }[];
  processing: boolean;
};

const sessions = new Map<string, TtsSession>();

// Caps how many messages can be waiting for synthesis+playback at once. Without this, a
// burst of messages arriving faster than the serial worker drains them (nothing upstream
// rate-limits ordinary, non-spam-flagged messages) could grow the queue without bound.
const MAX_QUEUE_LENGTH = 20;

// Serializes join/leave for a given guild so a second `/tts join` can't start establishing a
// new connection before a concurrent one has finished storing its session -- without this, the
// loser's connection could be created, immediately orphaned (never entered into `sessions`,
// never destroyed), or overwrite the winner's entry right after it's set.
const lifecycleLocks = new Map<string, Promise<unknown>>();

function withLifecycleLock<T>(guildId: string, task: () => Promise<T>): Promise<T> {
  const previous = lifecycleLocks.get(guildId) ?? Promise.resolve();
  const run = previous.then(task, task);
  lifecycleLocks.set(
    guildId,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );
  return run;
}

export function getSession(guildId: string): TtsSession | undefined {
  return sessions.get(guildId);
}

export function isJoined(guildId: string): boolean {
  return sessions.has(guildId);
}

export function join(voiceChannel: VoiceBasedChannel, textChannelId: string): Promise<boolean> {
  return withLifecycleLock(voiceChannel.guildId, () => joinNow(voiceChannel, textChannelId));
}

async function joinNow(voiceChannel: VoiceBasedChannel, textChannelId: string): Promise<boolean> {
  leaveNow(voiceChannel.guildId);

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guildId,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: false,
    // Avoids depending on @snazzah/davey's native binary at runtime for E2EE we don't need --
    // this bot only reads public channel text aloud, not anything privacy-sensitive.
    daveEncryption: false,
  });

  const player = createAudioPlayer();
  connection.subscribe(player);

  connection.on("error", (error) => console.error("[tts] voice connection error", error));
  player.on("error", (error) => console.error("[tts] audio player error", error));

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
  } catch (error) {
    console.error("[tts] failed to establish voice connection", error);
    connection.destroy();
    return false;
  }

  sessions.set(voiceChannel.guildId, {
    voiceChannelId: voiceChannel.id,
    textChannelId,
    connection,
    player,
    queue: [],
    processing: false,
  });
  return true;
}

export function leave(guildId: string): Promise<void> {
  return withLifecycleLock(guildId, () => {
    leaveNow(guildId);
    return Promise.resolve();
  });
}

function leaveNow(guildId: string): void {
  const session = sessions.get(guildId);
  if (!session) {
    return;
  }

  session.player.stop(true);
  session.connection.destroy();
  sessions.delete(guildId);
}

export type Synthesizer = (
  text: string,
  speakerId: number,
) => Promise<{ audio?: Buffer; error?: string }>;

// Enqueues one message's text for synthesis+playback, preserving arrival order even though
// synthesis takes real time -- the queue is drained strictly one item at a time.
//
// `expectedTextChannelId` must still match the session's binding at the moment of enqueueing,
// not just when the caller first looked the session up -- the caller may have awaited several
// lookups (dictionary resolution, TTS settings) in between, during which a `/tts leave` +
// `/tts join` to a different channel could have replaced the session entirely. Without this
// recheck, a message read under the old session's authority could get queued into a
// different one.
export function enqueue(
  guildId: string,
  expectedTextChannelId: string,
  text: string,
  speakerId: number,
  synthesize: Synthesizer,
): void {
  const session = sessions.get(guildId);
  if (!session || session.textChannelId !== expectedTextChannelId) {
    return;
  }

  if (session.queue.length >= MAX_QUEUE_LENGTH) {
    console.error(`[tts] queue full for guild ${guildId}, dropping message`);
    return;
  }

  session.queue.push({ text, speakerId });
  void processQueue(session, synthesize);
}

async function processQueue(session: TtsSession, synthesize: Synthesizer): Promise<void> {
  if (session.processing) {
    return;
  }

  session.processing = true;
  try {
    while (session.queue.length > 0) {
      const item = session.queue.shift();
      if (!item) {
        break;
      }

      try {
        const result = await synthesize(item.text, item.speakerId);
        if (!result.audio) {
          continue;
        }

        const resource = createAudioResource(Readable.from(result.audio), {
          inputType: StreamType.Arbitrary,
        });
        session.player.play(resource);
        await entersState(session.player, AudioPlayerStatus.Idle, 30_000).catch(() => undefined);
      } catch (error) {
        // Never let a single message's synthesis/playback failure throw uncaught -- this
        // process also serves the website, so an unhandled rejection here is not acceptable.
        console.error("[tts] failed to synthesize or play message", error);
      }
    }
  } finally {
    session.processing = false;
  }
}
