import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./dns", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./dns")>();
  return {
    ...actual,
    resolveHostnameToSafeIp: vi.fn(),
  };
});
vi.mock("./size", () => ({
  isValidSize: vi.fn(),
}));

import type { MockedFunction } from "vitest";

import { resolveHostnameToSafeIp } from "./dns";
import { BodySizeError } from "./Error/BodySizeError";
import { HeaderError } from "./Error/HeaderError";
import { InvalidDomainError } from "./Error/InvalidDomainError";
import { LocalAddressError } from "./Error/LocalAddressError";
import { RedirectError } from "./Error/RedirectError";
import { DEFAULT_MAX_REDIRECT } from "./redirect";
import { ALLOW_DISCORD_DOMAINS, safeFetch, safeFetchForDiscord } from "./safefetch";
import type { SafeUrl } from "./safeurl";
import { isValidSize } from "./size";

const resolveHostnameToSafeIpMock = resolveHostnameToSafeIp as MockedFunction<
  typeof resolveHostnameToSafeIp
>;
const isValidSizeMock = isValidSize as MockedFunction<typeof isValidSize>;

function url(s: string): SafeUrl {
  return s as SafeUrl;
}

function redirect(location: string, status = 301): Response {
  return new Response(null, { status, headers: { location } });
}

function ok(body = "ok"): Response {
  return new Response(body, { status: 200 });
}

// ─── safeFetchForDiscord ────────────────────────────────────────────────────

describe("safeFetchForDiscord", () => {
  let fetchMock: MockedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    resolveHostnameToSafeIpMock.mockResolvedValue("1.2.3.4");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("returns InvalidDomainError (not fetch) for a non-Discord URL like localhost", async () => {
    const result = await safeFetchForDiscord(url("http://localhost/"));
    expect(result).toBeInstanceOf(InvalidDomainError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns LocalAddressError if a Discord domain resolves to a private IP", async () => {
    resolveHostnameToSafeIpMock.mockResolvedValueOnce(null);
    const result = await safeFetchForDiscord(url("https://discord.com/api"));
    expect(result).toBeInstanceOf(LocalAddressError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(ALLOW_DISCORD_DOMAINS)("allows the Discord domain '%s'", async (domain) => {
    fetchMock.mockResolvedValueOnce(ok());
    const result = await safeFetchForDiscord(url(`https://${domain}/api`));
    expect(result).toBeInstanceOf(Response);
  });

  it("passes redirect: manual to fetch to prevent automatic redirect following", async () => {
    fetchMock.mockResolvedValueOnce(ok());
    await safeFetchForDiscord(url("https://discord.com/api"));
    const callInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(callInit?.redirect).toBe("manual");
  });

  it("returns InvalidDomainError for a non-Discord domain", async () => {
    const result = await safeFetchForDiscord(url("https://evil.com/"));
    expect(result).toBeInstanceOf(InvalidDomainError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a Discord lookalike domain (subdomain attack)", async () => {
    const result = await safeFetchForDiscord(url("https://discord.com.evil.com/"));
    expect(result).toBeInstanceOf(InvalidDomainError);
  });

  it("rejects an attacker-controlled subdomain of a Discord domain", async () => {
    const result = await safeFetchForDiscord(url("https://evil.discord.com/"));
    expect(result).toBeInstanceOf(InvalidDomainError);
  });
});

// ─── safeFetch ─────────────────────────────────────────────────────────────

describe("safeFetch", () => {
  let fetchMock: MockedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    resolveHostnameToSafeIpMock.mockResolvedValue("1.2.3.4");
    isValidSizeMock.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  // ── SSRF protection ──────────────────────────────────────────────────────

  it("returns LocalAddressError for a local IP literal without calling fetch", async () => {
    const result = await safeFetch(url("http://10.0.0.1/"));
    expect(result).toBeInstanceOf(LocalAddressError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns LocalAddressError when a hostname resolves to a private IP", async () => {
    resolveHostnameToSafeIpMock.mockResolvedValueOnce(null);
    const result = await safeFetch(url("https://evil.com/"));
    expect(result).toBeInstanceOf(LocalAddressError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns LocalAddressError when a redirect points to a local address (open-redirect SSRF)", async () => {
    fetchMock.mockResolvedValueOnce(redirect("http://192.168.1.1/internal"));
    const result = await safeFetch(url("https://example.com/"));
    expect(result).toBeInstanceOf(LocalAddressError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // ── Normal response ───────────────────────────────────────────────────────

  it("returns the Response directly for a 200 OK", async () => {
    fetchMock.mockResolvedValueOnce(ok("hello"));
    const result = await safeFetch(url("https://example.com/"));
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(200);
  });

  it("does not treat 304 Not Modified as a redirect", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(null, { status: 304, headers: { location: "https://other.com/" } }),
    );
    const result = await safeFetch(url("https://example.com/"));
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(304);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // ── Body size ─────────────────────────────────────────────────────────────

  it("returns BodySizeError when the response body exceeds the limit", async () => {
    fetchMock.mockResolvedValueOnce(ok("oversized body"));
    isValidSizeMock.mockResolvedValueOnce(false);
    const result = await safeFetch(url("https://example.com/"));
    expect(result).toBeInstanceOf(BodySizeError);
  });

  // ── Redirect header validation ────────────────────────────────────────────

  it("returns HeaderError when a redirect has no Location header", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 301 }));
    const result = await safeFetch(url("https://example.com/"));
    expect(result).toBeInstanceOf(HeaderError);
  });

  it("returns HeaderError when the Location header contains an invalid URL", async () => {
    // "http://[" has an unclosed IPv6 bracket → new URL() throws without percent-encoding the
    // input into a valid URL (unlike "not a url" whose spaces get encoded to %20 and succeed).
    fetchMock.mockResolvedValueOnce(
      new Response(null, { status: 302, headers: { location: "http://[" } }),
    );
    const result = await safeFetch(url("https://example.com/"));
    expect(result).toBeInstanceOf(HeaderError);
  });

  it("returns HeaderError when the redirect uses the file: protocol", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(null, { status: 302, headers: { location: "file:///etc/passwd" } }),
    );
    const result = await safeFetch(url("https://example.com/"));
    expect(result).toBeInstanceOf(HeaderError);
  });

  it("returns HeaderError when the redirect uses the javascript: protocol", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(null, { status: 302, headers: { location: "javascript:alert(1)" } }),
    );
    const result = await safeFetch(url("https://example.com/"));
    expect(result).toBeInstanceOf(HeaderError);
  });

  it("returns HeaderError when the redirect uses the data: protocol", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { location: "data:text/html,<script>alert(1)</script>" },
      }),
    );
    const result = await safeFetch(url("https://example.com/"));
    expect(result).toBeInstanceOf(HeaderError);
  });

  // ── Redirect limit ────────────────────────────────────────────────────────

  it(`returns RedirectError after more than ${DEFAULT_MAX_REDIRECT} redirects`, async () => {
    for (let i = 0; i <= DEFAULT_MAX_REDIRECT; i++) {
      fetchMock.mockResolvedValueOnce(redirect(`https://example.com/r${i}`));
    }
    const result = await safeFetch(url("https://example.com/start"));
    expect(result).toBeInstanceOf(RedirectError);
    expect(fetchMock).toHaveBeenCalledTimes(DEFAULT_MAX_REDIRECT + 1);
  });

  it("succeeds when redirect count is exactly at the limit", async () => {
    for (let i = 0; i < DEFAULT_MAX_REDIRECT; i++) {
      fetchMock.mockResolvedValueOnce(redirect(`https://example.com/r${i}`));
    }
    fetchMock.mockResolvedValueOnce(ok("done"));
    const result = await safeFetch(url("https://example.com/start"));
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(200);
  });

  // ── Credential leakage on cross-origin redirect ───────────────────────────

  it("strips Authorization and Cookie headers on a cross-origin redirect", async () => {
    fetchMock
      .mockResolvedValueOnce(redirect("https://other-origin.com/landing"))
      .mockResolvedValueOnce(ok());

    await safeFetch(url("https://example.com/path"), {
      headers: {
        authorization: "Bearer secret-token",
        cookie: "session=abc123",
        "x-custom": "keep-me",
      },
    });

    const secondInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const secondHeaders = new Headers(secondInit?.headers);
    expect(secondHeaders.get("authorization")).toBeNull();
    expect(secondHeaders.get("cookie")).toBeNull();
  });

  it("preserves Authorization on a same-origin redirect", async () => {
    fetchMock
      .mockResolvedValueOnce(redirect("https://example.com/other"))
      .mockResolvedValueOnce(ok());

    await safeFetch(url("https://example.com/path"), {
      headers: { authorization: "Bearer secret-token" },
    });

    const secondInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const secondHeaders = new Headers(secondInit?.headers);
    expect(secondHeaders.get("authorization")).toBe("Bearer secret-token");
  });

  it("strips credentials on cross-origin but keeps them if a later redirect returns to same origin", async () => {
    fetchMock
      .mockResolvedValueOnce(redirect("https://other.com/step1")) // cross-origin
      .mockResolvedValueOnce(redirect("https://other.com/step2")) // same origin as step1
      .mockResolvedValueOnce(ok());

    await safeFetch(url("https://example.com/start"), {
      headers: {
        authorization: "Bearer token",
        cookie: "s=x",
      },
    });

    // step2 fetch (index 1) should have stripped headers
    const step2Init = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const step2Headers = new Headers(step2Init?.headers);
    expect(step2Headers.get("authorization")).toBeNull();
    expect(step2Headers.get("cookie")).toBeNull();

    // step3 fetch (index 2) is same-origin to step2, so should still have stripped headers
    const step3Init = fetchMock.mock.calls[2]?.[1] as RequestInit;
    const step3Headers = new Headers(step3Init?.headers);
    expect(step3Headers.get("authorization")).toBeNull();
    expect(step3Headers.get("cookie")).toBeNull();
  });

  // ── Fetch options pass-through ────────────────────────────────────────────

  it("passes redirect: manual to fetch to prevent automatic following", async () => {
    fetchMock.mockResolvedValueOnce(ok());
    await safeFetch(url("https://example.com/"));
    const callInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(callInit?.redirect).toBe("manual");
  });

  // ── DNS pinning ───────────────────────────────────────────────────────────

  it("exposes the original hostname URL via response.url (not the pinned IP)", async () => {
    fetchMock.mockResolvedValueOnce(ok());
    const result = await safeFetch(url("https://example.com/path"));
    expect((result as Response).url).toBe("https://example.com/path");
  });

  it("wraps an IPv6 result in brackets when pinning the URL hostname", async () => {
    resolveHostnameToSafeIpMock.mockResolvedValueOnce("2001:db8::1");
    fetchMock.mockResolvedValueOnce(ok());
    await safeFetch(url("https://ipv6-host.example.com/path"));
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toBe("https://[2001:db8::1]/path");
  });
});
