import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./safefetch", () => ({
  safeFetch: vi.fn(),
}));

import type { MockedFunction } from "vitest";

import { LocalAddressError } from "./Error/LocalAddressError";
import { RedirectError } from "./Error/RedirectError";
import { DISCORD_DOMAINS, INVITE_PROTOCOL, isInviteLink, isUsedCf } from "./invite";
import { safeFetch } from "./safefetch";

const DISCORD_INVITE_LINK_START = [
  "https://discord.com/invite/",
  "https://ptb.discord.com/invite/",
  "https://canary.discord.com/invite/",
  "discord://discord.com/invite/",
  "discord://ptb.discord.com/invite/",
  "discord://canary.discord.com/invite/",
];

const safeFetchMock = safeFetch as MockedFunction<typeof safeFetch>;

function fakeResponse(
  responseUrl: string,
  status = 200,
  body = "",
  extraHeaders: Record<string, string> = {},
): Response {
  const obj = {
    url: responseUrl,
    status,
    headers: new Headers(extraHeaders),
    clone() {
      return fakeResponse(responseUrl, status, body, extraHeaders);
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

// ─── DISCORD_INVITE_LINK_START equivalence ───────────────────────────────────
//
// Verifies that the URL-parsing approach (isDiscordInviteLink) detects exactly
// the same URLs as the old DISCORD_INVITE_LINK_START.some(v => url.startsWith(v))
// approach, for both the final response URL and the Location response header.

describe("isInviteLink — DISCORD_INVITE_LINK_START equivalence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── resUrl path ─────────────────────────────────────────────────────────────

  describe("resUrl", () => {
    it.each(DISCORD_INVITE_LINK_START)("content: true — %s + invite code", async (prefix) => {
      safeFetchMock.mockResolvedValueOnce(fakeResponse(`${prefix}abc123`));
      const result = await isInviteLink("https://shortener.example.com/xyz");
      expect(result).not.toBeInstanceOf(Error);
      expect((result as { content: boolean }).content).toBe(true);
    });

    it.each([
      // no trailing slash → pathname stays /invite and does not match /invite/
      "https://discord.com/invite",
      "https://ptb.discord.com/invite",
      "https://canary.discord.com/invite",
      "discord://discord.com/invite",
      // non-invite path
      "https://discord.com/channels/123456/789012",
      "https://discord.com/",
      // subdomain spoofing
      "https://evil.discord.com/invite/abc123",
      // domain spoofing
      "https://discord.com.evil.com/invite/abc123",
      // unrelated domain
      "https://example.com/invite/abc123",
    ])("content: false — %s", async (nonInviteUrl) => {
      safeFetchMock.mockResolvedValueOnce(fakeResponse(nonInviteUrl));
      const result = await isInviteLink("https://shortener.example.com/xyz");
      expect(result).not.toBeInstanceOf(Error);
      expect((result as { content: boolean }).content).toBe(false);
    });
  });

  // ── location header path ────────────────────────────────────────────────────

  describe("location header", () => {
    it.each(DISCORD_INVITE_LINK_START)(
      "content: true — Location: %s + invite code",
      async (prefix) => {
        safeFetchMock.mockResolvedValueOnce(
          fakeResponse("https://example.com/", 200, "", { location: `${prefix}abc123` }),
        );
        const result = await isInviteLink("https://shortener.example.com/xyz");
        expect(result).not.toBeInstanceOf(Error);
        expect((result as { content: boolean }).content).toBe(true);
      },
    );

    it.each([
      "https://discord.com/invite",
      "https://evil.discord.com/invite/abc123",
      "https://discord.com.evil.com/invite/abc123",
      "https://example.com/invite/abc123",
    ])("content: false — Location: %s", async (location) => {
      safeFetchMock.mockResolvedValueOnce(
        fakeResponse("https://example.com/", 200, "", { location }),
      );
      const result = await isInviteLink("https://shortener.example.com/xyz");
      expect(result).not.toBeInstanceOf(Error);
      expect((result as { content: boolean }).content).toBe(false);
    });

    it("content: false when Location header is absent", async () => {
      safeFetchMock.mockResolvedValueOnce(fakeResponse("https://example.com/page"));
      const result = await isInviteLink("https://shortener.example.com/xyz");
      expect(result).not.toBeInstanceOf(Error);
      expect((result as { content: boolean }).content).toBe(false);
    });
  });

  // ── INVITE_PROTOCOL / DISCORD_DOMAINS exports ────────────────────────────────
  // Verifies that all protocols and hosts present in the legacy DISCORD_INVITE_LINK_START
  // are covered by their respective constants without omission.

  it("INVITE_PROTOCOL covers all protocols used in DISCORD_INVITE_LINK_START", () => {
    const usedProtocols = new Set(DISCORD_INVITE_LINK_START.map((url) => new URL(url).protocol));
    for (const protocol of usedProtocols) {
      expect(INVITE_PROTOCOL).toContain(protocol);
    }
  });

  it("DISCORD_DOMAINS covers all hosts used in DISCORD_INVITE_LINK_START", () => {
    const usedHosts = new Set(DISCORD_INVITE_LINK_START.map((url) => new URL(url).hostname));
    for (const host of usedHosts) {
      expect(DISCORD_DOMAINS).toContain(host);
    }
  });
});
