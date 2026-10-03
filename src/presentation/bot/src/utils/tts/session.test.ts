import { EventEmitter } from "node:events";

import type { AppCore } from "app-core";
import type { VoiceBasedChannel } from "discord.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Keep the real VoiceConnectionStatus enum -- the handler under test branches on it.
vi.mock("@discordjs/voice", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@discordjs/voice")>();
  return {
    ...actual,
    joinVoiceChannel: vi.fn(),
    createAudioPlayer: vi.fn(),
    entersState: vi.fn(),
  };
});

import {
  createAudioPlayer,
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";

import { isJoined, join } from "./session";

class FakeConnection extends EventEmitter {
  public state: { status: VoiceConnectionStatus } = { status: VoiceConnectionStatus.Ready };
  public subscribe = vi.fn();
  public destroy = vi.fn(() => {
    this.state = { status: VoiceConnectionStatus.Destroyed };
  });
}

function fakePlayer() {
  const player = new EventEmitter() as EventEmitter & { stop: ReturnType<typeof vi.fn> };
  player.stop = vi.fn();
  return player;
}

function fakeCore() {
  return {
    tts: {
      saveVoiceSession: vi.fn().mockResolvedValue(undefined),
      clearVoiceSession: vi.fn().mockResolvedValue(undefined),
    },
  } as unknown as AppCore;
}

function fakeChannel(guildId: string) {
  return {
    id: `vc-${guildId}`,
    guildId,
    guild: { voiceAdapterCreator: {} },
  } as unknown as VoiceBasedChannel;
}

// joinNow awaits entersState(Ready); the Disconnected handler races
// entersState(Signalling)/entersState(Connecting) and then awaits Ready too. Dispatching on
// the requested status lets one mock serve all of them without relying on call ordering.
function mockEntersState({
  reconnecting,
  reachesReady = true,
}: {
  reconnecting: boolean;
  reachesReady?: boolean;
}) {
  // `status` widens to AudioPlayerStatus from entersState's first overload; both are string
  // enums, so compare the underlying values rather than fighting the overload resolution.
  vi.mocked(entersState).mockImplementation(async (_target, status) => {
    if ((status as string) === (VoiceConnectionStatus.Ready as string)) {
      if (!reachesReady) {
        throw new Error("stalled before Ready");
      }
      return undefined as never;
    }
    if (reconnecting) {
      return undefined as never;
    }
    throw new Error("not reconnecting");
  });
}

async function joinWith(guildId: string, connection: FakeConnection, core: AppCore) {
  vi.mocked(joinVoiceChannel).mockReturnValue(connection as never);
  vi.mocked(createAudioPlayer).mockReturnValue(fakePlayer() as never);
  return join(fakeChannel(guildId), `text-${guildId}`, core);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Each test uses its own guildId -- `sessions` is module-level state shared across tests.
describe("voice connection Disconnected handling", () => {
  test("tears down the session when the connection is not reconnecting", async () => {
    const guildId = "guild-teardown";
    const core = fakeCore();
    const connection = new FakeConnection();
    mockEntersState({ reconnecting: false });

    expect(await joinWith(guildId, connection, core)).toBe(true);
    expect(isJoined(guildId)).toBe(true);

    connection.emit(VoiceConnectionStatus.Disconnected);
    await vi.waitFor(() => expect(isJoined(guildId)).toBe(false));

    expect(connection.destroy).toHaveBeenCalled();
  });

  // The invariant that keeps a rolling update working: the old pod lands in this handler when
  // the new pod takes over the connection, and clearing Redis there would delete the pointer
  // the new pod just restored. See the handler's own comment in session.ts.
  test("does not clear the persisted Redis pointer on disconnect", async () => {
    const guildId = "guild-keeps-pointer";
    const core = fakeCore();
    const connection = new FakeConnection();
    mockEntersState({ reconnecting: false });

    await joinWith(guildId, connection, core);
    connection.emit(VoiceConnectionStatus.Disconnected);
    await vi.waitFor(() => expect(isJoined(guildId)).toBe(false));

    expect(core.tts.clearVoiceSession).not.toHaveBeenCalled();
  });

  test("keeps the session when the connection is only hopping (channel move / failover)", async () => {
    const guildId = "guild-reconnects";
    const core = fakeCore();
    const connection = new FakeConnection();
    mockEntersState({ reconnecting: true });

    await joinWith(guildId, connection, core);

    connection.emit(VoiceConnectionStatus.Disconnected);
    await vi.waitFor(() => expect(vi.mocked(entersState).mock.calls.length).toBeGreaterThan(1));

    expect(isJoined(guildId)).toBe(true);
    expect(connection.destroy).not.toHaveBeenCalled();
  });

  // Reaching Signalling/Connecting only proves a reconnect started. A handshake that stalls
  // there would otherwise leave the session joined but permanently silent.
  test("tears down when a reconnect starts but never reaches Ready", async () => {
    const guildId = "guild-stalled";
    const core = fakeCore();
    const connection = new FakeConnection();
    mockEntersState({ reconnecting: true });

    expect(await joinWith(guildId, connection, core)).toBe(true);

    // Now the reconnect gets as far as Signalling/Connecting but stalls before Ready.
    mockEntersState({ reconnecting: true, reachesReady: false });
    connection.emit(VoiceConnectionStatus.Disconnected);
    await vi.waitFor(() => expect(isJoined(guildId)).toBe(false));

    expect(connection.destroy).toHaveBeenCalled();
    expect(core.tts.clearVoiceSession).not.toHaveBeenCalled();
  });

  test("a late disconnect does not tear down a session a newer join already replaced", async () => {
    const guildId = "guild-replaced";
    const core = fakeCore();
    const stale = new FakeConnection();
    const current = new FakeConnection();
    mockEntersState({ reconnecting: false });

    await joinWith(guildId, stale, core);
    // A second /tts join replaces the session; joinNow tears the old connection down itself.
    await joinWith(guildId, current, core);

    stale.emit(VoiceConnectionStatus.Disconnected);
    await vi.waitFor(() => expect(vi.mocked(entersState).mock.calls.length).toBeGreaterThan(2));

    expect(isJoined(guildId)).toBe(true);
    expect(current.destroy).not.toHaveBeenCalled();
  });
});
