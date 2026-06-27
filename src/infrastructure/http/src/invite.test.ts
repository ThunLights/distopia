import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./safefetch", () => ({
  safeFetch: vi.fn(),
}));

import type { MockedFunction } from "vitest";

import { LocalAddressError } from "./Error/LocalAddressError";
import { RedirectError } from "./Error/RedirectError";
import { DISCORD_INVITE_LINK_START, isInviteLink, isUsedCf } from "./invite";
import { safeFetch } from "./safefetch";

const safeFetchMock = safeFetch as MockedFunction<typeof safeFetch>;

function fakeResponse(responseUrl: string, status = 200, body = ""): Response {
  const obj = {
    url: responseUrl,
    status,
    headers: new Headers(),
    clone() {
      return fakeResponse(responseUrl, status, body);
    },
    async text() {
      return body;
    },
    body: null as null,
  };
  return obj as unknown as Response;
}

// ─── isUsedCf ───────────────────────────────────────────────────────────────

describe("isUsedCf", () => {
  it("returns false for a non-403 response", async () => {
    const res = fakeResponse("https://example.com", 200, "<html><title>Welcome</title></html>");
    expect(await isUsedCf(res)).toBe(false);
  });

  it("returns false for a 200 with a Cloudflare-like title", async () => {
    const res = fakeResponse(
      "https://example.com",
      200,
      "<html><title>Just a moment...</title></html>",
    );
    expect(await isUsedCf(res)).toBe(false);
  });

  it("returns true for a 403 with the exact Cloudflare title", async () => {
    const html =
      "<html><head><title>Just a moment...</title></head><body>CF challenge</body></html>";
    const res = fakeResponse("https://example.com", 403, html);
    expect(await isUsedCf(res)).toBe(true);
  });

  it("returns false for a 403 with a different title", async () => {
    const html = "<html><head><title>Access Denied</title></head><body>Forbidden</body></html>";
    const res = fakeResponse("https://example.com", 403, html);
    expect(await isUsedCf(res)).toBe(false);
  });

  it("returns false for a 403 with no <title> element", async () => {
    const html = "<html><body>Forbidden</body></html>";
    const res = fakeResponse("https://example.com", 403, html);
    expect(await isUsedCf(res)).toBe(false);
  });

  it("returns false for a 403 with a title that partially matches", async () => {
    const html = "<html><head><title>Just a moment</title></head></html>";
    const res = fakeResponse("https://example.com", 403, html);
    expect(await isUsedCf(res)).toBe(false);
  });

  it("returns false for a 403 with an empty title", async () => {
    const html = "<html><head><title></title></head></html>";
    const res = fakeResponse("https://example.com", 403, html);
    expect(await isUsedCf(res)).toBe(false);
  });
});

// ─── isInviteLink ────────────────────────────────────────────────────────────

describe("isInviteLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("propagates LocalAddressError from safeFetch (SSRF attempt)", async () => {
    safeFetchMock.mockResolvedValueOnce(new LocalAddressError("local address"));
    const result = await isInviteLink("http://192.168.1.1/");
    expect(result).toBeInstanceOf(LocalAddressError);
  });

  it("propagates RedirectError from safeFetch", async () => {
    safeFetchMock.mockResolvedValueOnce(new RedirectError("too many redirects"));
    const result = await isInviteLink("https://example.com/loop");
    expect(result).toBeInstanceOf(RedirectError);
  });

  it.each(DISCORD_INVITE_LINK_START)(
    "returns content: true when the final URL is a Discord invite (%s)",
    async (prefix) => {
      safeFetchMock.mockResolvedValueOnce(fakeResponse(`${prefix}abc123`));
      const result = await isInviteLink("https://shortener.example.com/xyz");
      expect(result).not.toBeInstanceOf(Error);
      expect((result as { content: boolean }).content).toBe(true);
    },
  );

  it("returns content: false when the final URL is not a Discord invite", async () => {
    safeFetchMock.mockResolvedValueOnce(fakeResponse("https://example.com/some-page"));
    const result = await isInviteLink("https://example.com/some-page");
    expect(result).not.toBeInstanceOf(Error);
    expect((result as { content: boolean }).content).toBe(false);
  });

  it("returns content: false when the URL starts with but is not an exact invite prefix", async () => {
    // "https://discord.com/invite" without trailing slash should not match "/invite/"
    safeFetchMock.mockResolvedValueOnce(fakeResponse("https://discord.com/invite"));
    const result = await isInviteLink("https://discord.com/invite");
    expect(result).not.toBeInstanceOf(Error);
    expect((result as { content: boolean }).content).toBe(false);
  });

  it("returns isUsedCf: true when response is a Cloudflare 403 challenge", async () => {
    const html = "<html><head><title>Just a moment...</title></head><body>CF</body></html>";
    safeFetchMock.mockResolvedValueOnce(fakeResponse("https://example.com/", 403, html));
    const result = await isInviteLink("https://example.com/");
    expect(result).not.toBeInstanceOf(Error);
    expect((result as { isUsedCf: boolean }).isUsedCf).toBe(true);
  });

  it("returns isUsedCf: false for a normal 200 response", async () => {
    safeFetchMock.mockResolvedValueOnce(
      fakeResponse("https://example.com/page", 200, "<html><body>Hello</body></html>"),
    );
    const result = await isInviteLink("https://example.com/page");
    expect(result).not.toBeInstanceOf(Error);
    expect((result as { isUsedCf: boolean }).isUsedCf).toBe(false);
  });

  it("sends the request with a User-Agent header", async () => {
    safeFetchMock.mockResolvedValueOnce(fakeResponse("https://example.com/"));
    await isInviteLink("https://example.com/");
    const callInit = safeFetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((callInit?.headers as Record<string, string>)?.["User-Agent"]).toBe("Mozilla/5.0");
  });
});
