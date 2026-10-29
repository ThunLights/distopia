import type { AppCore } from "app-core";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { scheduleStickyRepost } from "./stickyMessage";

type Arg = Parameters<typeof scheduleStickyRepost>[1];

const message = (channelId: string) =>
  ({ inGuild: () => true, author: { bot: false }, guildId: "g", channelId }) as unknown as Arg;

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

test("a burst of messages during the wait triggers a single repost", async () => {
  const repost = vi.fn().mockResolvedValue(undefined);
  const core = {
    stickyMessage: { find: vi.fn().mockResolvedValue({}), repost },
  } as unknown as AppCore;

  await scheduleStickyRepost(core, message("burst"));
  await scheduleStickyRepost(core, message("burst"));
  await vi.advanceTimersByTimeAsync(5_000);
  await vi.advanceTimersByTimeAsync(5_000);

  expect(repost).toHaveBeenCalledOnce();
});

test("a message arriving mid-repost is followed by another repost", async () => {
  let finish!: () => void;
  const repost = vi
    .fn()
    .mockImplementationOnce(() => new Promise<void>((resolve) => (finish = resolve)))
    .mockResolvedValue(undefined);
  const core = {
    stickyMessage: { find: vi.fn().mockResolvedValue({}), repost },
  } as unknown as AppCore;

  await scheduleStickyRepost(core, message("inflight"));
  await vi.advanceTimersByTimeAsync(5_000);
  await scheduleStickyRepost(core, message("inflight"));
  finish();
  await vi.advanceTimersByTimeAsync(5_000);

  expect(repost).toHaveBeenCalledTimes(2);
});

test("bot messages never trigger a repost", async () => {
  const find = vi.fn();
  const core = { stickyMessage: { find } } as unknown as AppCore;
  const botMessage = { inGuild: () => true, author: { bot: true } } as unknown as Arg;

  await scheduleStickyRepost(core, botMessage);

  expect(find).not.toHaveBeenCalled();
});
