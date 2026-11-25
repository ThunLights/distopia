import type { AppCore } from "app-core";
import { afterEach, describe, expect, test, vi } from "vitest";

const handlers: ((message: string) => void)[] = [];
vi.mock("infra-redis", () => ({
  subscribeRedis: vi.fn(async (_url: string, _channel: string, onMessage: (m: string) => void) => {
    handlers.push(onMessage);
  }),
}));

import { takeOverVoiceSessions } from "./handover";

function fakeCore(receivers: number) {
  const publish = vi.fn(async (_channel: string, _message: string) => receivers);
  return { core: { state: { redis: { publish } } } as unknown as AppCore, publish };
}

const deliver = (message: object) => handlers.at(-1)?.(JSON.stringify(message));

afterEach(() => {
  handlers.length = 0;
  vi.useRealTimers();
});

describe("takeOverVoiceSessions", () => {
  test("resolves at once when no other process is subscribed", async () => {
    const { core } = fakeCore(1);
    await expect(takeOverVoiceSessions(core, "redis://", async () => {})).resolves.toBeUndefined();
  });

  test("waits for the other process to release, or times out", async () => {
    vi.useFakeTimers();
    const { core, publish } = fakeCore(2);
    let done = false;
    const takeOver = takeOverVoiceSessions(core, "redis://", async () => {}).then(() => {
      done = true;
    });
    await vi.waitFor(() => expect(publish).toHaveBeenCalled());
    const { from } = JSON.parse(publish.mock.calls[0]![1]) as { from: string };

    deliver({ type: "released", from: "old", to: "someone-else" });
    await Promise.resolve();
    expect(done).toBe(false);

    deliver({ type: "released", from: "old", to: from });
    await takeOver;
    expect(done).toBe(true);

    const timedOut = takeOverVoiceSessions(core, "redis://", async () => {});
    await vi.waitFor(() => expect(publish).toHaveBeenCalledTimes(2));
    await vi.advanceTimersByTimeAsync(5_000);
    await expect(timedOut).resolves.toBeUndefined();
  });

  test("releases its own sessions and acknowledges another process's request", async () => {
    const { core, publish } = fakeCore(1);
    const releaseAll = vi.fn(async () => {});
    await takeOverVoiceSessions(core, "redis://", releaseAll);

    deliver({ type: "request", from: "new" });
    await vi.waitFor(() => expect(publish).toHaveBeenCalledTimes(2));
    expect(releaseAll).toHaveBeenCalledTimes(1);
    expect(JSON.parse(publish.mock.calls[1]![1])).toMatchObject({ type: "released", to: "new" });
  });
});
