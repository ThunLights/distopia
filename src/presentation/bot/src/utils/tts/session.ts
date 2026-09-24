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
// across) a restart, so they stay a plain local Map here rather than moving to Redis like
// the rest of the app's formerly-in-memory state (see repo-redis).
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

  const session: TtsSession = {
    voiceChannelId: voiceChannel.id,
    textChannelId,
    connection,
    player,
    queue: [],
    processing: false,
  };
  sessions.set(voiceChannel.guildId, session);
  // Persisted after the in-memory session, not before -- a crash between the two would just
  // leave nothing to restore (safe), whereas the reverse order could persist a session that
  // never actually got a live connection.
  try {
    await core.tts.saveVoiceSession({
      guildId: voiceChannel.guildId,
      voiceChannelId: voiceChannel.id,
      textChannelId,
    });
  } catch (error) {
    // Without this, a rejected save leaves a live connection in `sessions` that Redis never
    // learns about -- indistinguishable from a successful join to every caller (TtsCommand's
    // `.then` only branches on the returned boolean), so the caller would report success
    // while this guild silently can't be restored after the next restart. Tear down and
    // report failure instead, same as the entersState(Ready) failure path above.
    console.error("[tts] failed to persist voice session", error);
    session.player.stop(true);
    session.connection.destroy();
    sessions.delete(voiceChannel.guildId);
    return false;
  }
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

  // Cleared before local teardown, not after -- clearing it after meant a rejection here
  // (Redis unreachable) left a stale pointer behind even though the connection was already
  // torn down locally, so a later restart would wrongly rejoin a channel the user explicitly
  // left. Teardown still proceeds either way, so leave() stays responsive even if this fails.
  try {
    await core.tts.clearVoiceSession(guildId);
  } catch (error) {
    console.error(`[tts] failed to clear persisted voice session for guild ${guildId}`, error);
  }

  session.player.stop(true);
  session.connection.destroy();
  sessions.delete(guildId);
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

      // Checked before attempting the connection, not just after: entersState(Ready) doesn't
      // fail fast on a missing Connect permission, it times out after join()'s own 15s wait --
      // checking first avoids that wasted wait, and lets a permanently-missing Connect be
      // treated the same as a deleted channel (clear the pointer) rather than as a transient
      // failure worth retrying forever.
      const botMember = channel.guild.members.me;
      const voicePermissions = botMember ? channel.permissionsFor(botMember) : null;
      if (!voicePermissions?.has(PermissionFlagsBits.Connect)) {
        await core.tts.clearVoiceSession(guildId);
        continue;
      }

      const joined = await join(channel, textChannelId, core);
      if (!joined) {
        // Transient failure (e.g. a voice server hiccup) -- leave the pointer in place so
        // the next restart gets another chance, rather than giving up on this guild for good.
        continue;
      }

      // Speak can't be checked before entersState(Ready) the same way Connect can -- Ready
      // only requires Connect -- so this still needs a check after joining, same as a fresh
      // /tts join. Reuses the permissions snapshot taken before join() rather than
      // re-fetching; permissions changing mid-join is rare enough not to be worth it.
      if (!voicePermissions.has(PermissionFlagsBits.Speak)) {
        await leave(guildId, core);
      }
    } catch (error) {
      // Does NOT clear the persisted pointer here -- only the confirmed-invalid cases above
      // (missing channel, missing Connect) do that. An error reaching this catch is an
      // unexpected one (e.g. a transient Discord API blip from guilds.fetch/channels.fetch),
      // exactly the kind that should get retried on the next restart, not treated as permanent.
      console.error(`[tts] failed to restore voice session for guild ${guildId}`, error);
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
