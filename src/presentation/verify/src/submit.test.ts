import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./checks", () => ({ evaluate: vi.fn() }));
vi.mock("./plugin", () => ({ decrypt: vi.fn() }));

import type { BotClient } from "./bot";
import { evaluate } from "./checks";
import * as plugin from "./plugin";
import { submit, type SubmitDeps } from "./submit";

const clean = { isVpn: false, isProxy: false, isTor: false };

function setup(setting: Record<string, unknown> | null = { enabled: true, roleId: "role" }) {
  const create = vi.fn(async (row: object) => ({
    ...row,
    relatedUserIds: [],
    createdAt: new Date(0),
  }));
  const bot: BotClient = {
    giveRole: vi.fn(async () => {}),
    depriveRole: vi.fn(async () => {}),
    sendMessage: vi.fn(async () => {}),
  };
  const deps = {
    database: {
      guildVerify: { find: vi.fn(async () => setting) },
      userDiscord: { find: vi.fn(async () => ({ accessToken: "tok", email: "a@example.com" })) },
      userVerifyLog: { create, findByFingerprintHashes: vi.fn(async () => []) },
    },
    fetchGuilds: vi.fn(async () => [{ id: "1" }]),
    bot,
    turnstileSecret: "secret",
  } as unknown as SubmitDeps;
  return { deps, bot, create };
}

const input = {
  userId: "100",
  body: JSON.stringify({ guildId: "1", turnstileToken: "t" }),
  encrypted: false,
  request: { headers: {}, ip: "203.0.113.1" },
};

describe("submit", () => {
  beforeEach(() => {
    vi.mocked(evaluate).mockReset();
    vi.mocked(plugin.decrypt).mockReset();
  });

  it("grants the role and logs success when every check passes", async () => {
    vi.mocked(evaluate).mockResolvedValue({ allowed: true, vpn: clean });
    const { deps, bot, create } = setup();

    expect(await submit(deps, input)).toEqual({ ok: true });
    expect(bot.giveRole).toHaveBeenCalledWith("1", "100", "role");
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("rejects an invalid body without touching the database", async () => {
    const { deps } = setup();

    const result = await submit(deps, { ...input, body: "not json" });

    expect(result).toEqual({ ok: false, error: "Invalid Body" });
    expect(deps.database.guildVerify.find).not.toHaveBeenCalled();
  });

  it.each([
    ["a non-numeric guildId", { guildId: "abc", turnstileToken: "t" }],
    ["a missing guildId", { turnstileToken: "t" }],
    ["an empty turnstileToken", { guildId: "1", turnstileToken: "" }],
    ["a missing turnstileToken", { guildId: "1" }],
    ["an oversized turnstileToken", { guildId: "1", turnstileToken: "x".repeat(2049) }],
  ])("rejects %s before any lookup", async (_name, payload) => {
    const { deps, bot } = setup();

    const result = await submit(deps, { ...input, body: JSON.stringify(payload) });

    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("Invalid Body") });
    expect(deps.database.guildVerify.find).not.toHaveBeenCalled();
    expect(bot.giveRole).not.toHaveBeenCalled();
  });

  it("rejects an oversized body before parsing it", async () => {
    const { deps } = setup();

    const body = JSON.stringify({ guildId: "1", turnstileToken: "t", extra: "x".repeat(30_000) });

    expect(await submit(deps, { ...input, body })).toEqual({ ok: false, error: "Invalid Body" });
    expect(deps.database.guildVerify.find).not.toHaveBeenCalled();
  });

  it("rejects a userId that is not a snowflake", async () => {
    const { deps } = setup();

    expect(await submit(deps, { ...input, userId: "1; DROP" })).toEqual({
      ok: false,
      error: "Invalid User",
    });
    expect(deps.database.guildVerify.find).not.toHaveBeenCalled();
  });

  it("fails when the plugin cannot decrypt an encrypted body", async () => {
    vi.mocked(plugin.decrypt).mockResolvedValue(null);
    const { deps } = setup();

    expect(await submit(deps, { ...input, encrypted: true })).toEqual({
      ok: false,
      error: "Invalid Body",
    });
  });

  it("only uses extra from a plugin-decrypted body", async () => {
    vi.mocked(evaluate).mockResolvedValue({ allowed: true, vpn: clean });
    const body = JSON.stringify({ guildId: "1", turnstileToken: "t", extra: { a: 1 } });

    await submit(setup().deps, { ...input, body });
    expect(vi.mocked(evaluate).mock.calls[0]![0].extra).toBeNull();

    vi.mocked(plugin.decrypt).mockResolvedValue(body);
    await submit(setup().deps, { ...input, body: "cipher", encrypted: true });
    expect(vi.mocked(evaluate).mock.calls[1]![0].extra).toEqual({ a: 1 });
  });

  it("refuses when verification is disabled", async () => {
    const { deps, bot } = setup({ enabled: false, roleId: "role" });

    expect(await submit(deps, input)).toEqual({ ok: false, error: "認証は有効になっていません" });
    expect(bot.giveRole).not.toHaveBeenCalled();
  });

  it("refuses a user who is not in the guild", async () => {
    const { deps } = setup();
    vi.mocked(deps.fetchGuilds).mockResolvedValue([{ id: "999" }]);

    expect(await submit(deps, input)).toEqual({
      ok: false,
      error: "対象サーバーのメンバーではありません",
    });
  });

  it("does not call a rejected OAuth2 token a membership failure", async () => {
    const { deps, bot } = setup();
    vi.mocked(deps.fetchGuilds).mockResolvedValue(null);

    const result = await submit(deps, input);

    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("ログインし直して") });
    expect(bot.giveRole).not.toHaveBeenCalled();
  });

  it("fails when removing the pending role fails after the grant", async () => {
    vi.mocked(evaluate).mockResolvedValue({ allowed: true, vpn: clean });
    const { deps, bot } = setup({ enabled: true, roleId: "role", pendingRoleId: "wait" });
    vi.mocked(bot.depriveRole).mockRejectedValue(new Error("missing permissions"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await submit(deps, input)).toEqual({ ok: false, error: "ロールの付与に失敗しました" });
  });

  it("logs the refusal and grants nothing when a check refuses", async () => {
    vi.mocked(evaluate).mockResolvedValue({
      allowed: false,
      reason: "Used VPN",
      vpn: { ...clean, isVpn: true },
    });
    const { deps, bot, create } = setup();

    expect(await submit(deps, input)).toEqual({ ok: false, error: "認証に失敗しました: Used VPN" });
    expect(bot.giveRole).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ success: false, isVpn: true }));
  });

  it("posts the log to the configured channel and keeps going if that fails", async () => {
    vi.mocked(evaluate).mockResolvedValue({ allowed: true, vpn: clean });
    const { deps, bot } = setup({ enabled: true, roleId: "role", logChannelId: "chan" });
    vi.mocked(bot.sendMessage).mockRejectedValue(new Error("missing access"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await submit(deps, input)).toEqual({ ok: true });
    expect(bot.sendMessage).toHaveBeenCalledWith("chan", expect.any(Array));
  });
});
