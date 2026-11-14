import { afterEach, describe, expect, it, vi, type MockedFunction } from "vitest";

vi.mock("infra-http", async (importOriginal) => {
  const actual = await importOriginal<typeof import("infra-http")>();
  return { ...actual, safeFetchForDiscord: vi.fn() };
});

import { LocalAddressError, safeFetchForDiscord } from "infra-http";

import { OAuth2Controller } from "./OAuth2Controller";

const mock = safeFetchForDiscord as MockedFunction<typeof safeFetchForDiscord>;
const json = (status: number, body: unknown) =>
  new Response(body === null ? null : JSON.stringify(body), { status });

const controller = new OAuth2Controller({
  id: "id",
  secret: "secret",
  url: "https://distopia.top/auth",
  token: "bot",
});

afterEach(() => vi.clearAllMocks());

describe("OAuth2Controller", () => {
  it("maps token responses and routes through safeFetchForDiscord", async () => {
    mock.mockResolvedValueOnce(json(200, { access_token: "a", refresh_token: "r" }));
    expect(await controller.parseCode("code")).toEqual({ accessToken: "a", refreshToken: "r" });
    expect(String(mock.mock.calls[0]![0])).toBe("https://discord.com/api/v10/oauth2/token");
  });

  it("returns null on Discord errors and blocked requests", async () => {
    mock.mockResolvedValueOnce(json(401, { message: "invalid" }));
    expect(await controller.fetchUserInfo("t")).toBeNull();
    mock.mockResolvedValueOnce(new LocalAddressError("blocked"));
    expect(await controller.fetchUserInfo("t")).toBeNull();
  });

  it("returns null only for invalid_grant on refresh, throws on transient failures", async () => {
    mock.mockResolvedValueOnce(json(400, { error: "invalid_grant" }));
    expect(await controller.resetAccessToken("r")).toBeNull();
    mock.mockResolvedValueOnce(json(500, { message: "down" }));
    await expect(controller.resetAccessToken("r")).rejects.toThrow();
    mock.mockResolvedValueOnce(new LocalAddressError("blocked"));
    await expect(controller.resetAccessToken("r")).rejects.toThrow();
  });

  it("maps joinGuild results", async () => {
    mock.mockResolvedValueOnce(json(201, {}));
    expect(await controller.joinGuild("u", "g", "t")).toBe("join");
    mock.mockResolvedValueOnce(json(204, null));
    expect(await controller.joinGuild("u", "g", "t")).toBe("joined");
    mock.mockResolvedValueOnce(json(403, { message: "no" }));
    expect(await controller.joinGuild("u", "g", "t")).toBeNull();
  });
});
