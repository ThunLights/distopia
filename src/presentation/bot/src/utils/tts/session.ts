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
import type { AppCore } from "app-core";
import { PermissionFlagsBits, type Client, type VoiceBasedChannel } from "discord.js";

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

export function join(
  voiceChannel: VoiceBasedChannel,
  textChannelId: string,
  core: AppCore,
): Promise<boolean> {
  return withLifecycleLock(voiceChannel.guildId, () => joinNow(voiceChannel, textChannelId, core));
}

async function joinNow(
  voiceChannel: VoiceBasedChannel,
  textChannelId: string,
  core: AppCore,
): Promise<boolean> {
  await leaveNow(voiceChannel.guildId, core);

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guildId,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: false,
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
  // Persisted after the in-memory session, not before -- a crash between the two would just
  // leave nothing to restore (safe), whereas the reverse order could persist a session that
  // never actually got a live connection.
  await core.tts.saveVoiceSession({
    guildId: voiceChannel.guildId,
    voiceChannelId: voiceChannel.id,
    textChannelId,
  });
  return true;
}

export function leave(guildId: string, core: AppCore): Promise<void> {
  return withLifecycleLock(guildId, () => leaveNow(guildId, core));
}

async function leaveNow(guildId: string, core: AppCore): Promise<void> {
  const session = sessions.get(guildId);
  if (!session) {
    return;
  }

  session.player.stop(true);
  session.connection.destroy();
  sessions.delete(guildId);
  await core.tts.clearVoiceSession(guildId);
}

// Called once from index.ts's `clientReady` handler to rejoin every guild's TTS session
// that survived a restart -- a rolling update kills the old pod's process (and with it every
// live voice connection), but the Redis-backed pointer (see Tts.saveVoiceSession) tells the
// new pod who to rejoin. Uses fetch() rather than the cache for both guild and channel: this
// runs right after `clientReady` fires, before every guild's channel list is necessarily
// cached yet.
export async function restoreSessions(client: Client<true>, core: AppCore): Promise<void> {
  const persisted = await core.tts.getAllVoiceSessions();

  for (const { guildId, voiceChannelId, textChannelId } of persisted) {
    try {
      const guild = await client.guilds.fetch(guildId);
      const channel = await guild.channels.fetch(voiceChannelId);
      if (!channel || !channel.isVoiceBased()) {
        await core.tts.clearVoiceSession(guildId);
        continue;
      }

      const joined = await join(channel, textChannelId, core);
      if (!joined) {
        // Transient failure (e.g. a voice server hiccup) -- leave the pointer in place so
        // the next restart gets another chance, rather than giving up on this guild for good.
        continue;
      }

      // Mirrors the permission check TtsCommand's own /tts join does: entering Ready only
      // requires Connect, so a channel that also denies Speak still lets the bot sit there
      // silently unless this catches it and backs the session out again.
      const botMember = channel.guild.members.me;
      const voicePermissions = botMember ? channel.permissionsFor(botMember) : null;
      if (
        !voicePermissions?.has(PermissionFlagsBits.Connect) ||
        !voicePermissions.has(PermissionFlagsBits.Speak)
      ) {
        await leave(guildId, core);
      }
    } catch (error) {
      console.error(`[tts] failed to restore voice session for guild ${guildId}`, error);
      await core.tts.clearVoiceSession(guildId).catch(() => undefined);
    }
  }
}

// Stops whatever's currently playing so processQueue's `entersState(..., Idle, ...)` wait
// resolves immediately and moves on to the next queued item -- there's nothing else to
// "skip" to if the queue is otherwise empty, this just cuts the current one short.
export function skip(guildId: string): boolean {
  const session = sessions.get(guildId);
  if (!session || session.player.state.status !== AudioPlayerStatus.Playing) {
    return false;
  }

  session.player.stop(true);
  return true;
}

export type Synthesizer = (
  text: string,
  speakerId: number,
) => Promise<{ audio?: Buffer; error?: string }>;

// Preserves arrival order (drained strictly one item at a time) even though synthesis takes
// real time. `expectedTextChannelId` must still match the session's binding at enqueue time,
// not just when the caller first looked it up -- awaited lookups in between (dictionary,
// settings) could let a `/tts leave` + `/tts join` swap the session, so without this recheck
// a message could land in the wrong channel's queue.
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
