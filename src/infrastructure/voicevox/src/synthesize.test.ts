import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("infra-http", async (importOriginal) => {
  const actual = await importOriginal<typeof import("infra-http")>();
  return { ...actual, safeFetch: vi.fn() };
});

import { safeFetch } from "infra-http";

import { synthesize } from "./synthesize";

const mockSafeFetch = vi.mocked(safeFetch);

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

function audioResponse(bytes: number[]): Response {
  return {
    ok: true,
    status: 200,
    arrayBuffer: async () => new Uint8Array(bytes).buffer,
    text: async () => "",
  } as Response;
}

// Simulates a gateway/proxy error page: HTTP-level failure (or a 200 with a body that isn't
// valid JSON), where .json() itself throws instead of resolving.
function nonJsonResponse(ok: boolean, status: number): Response {
  return {
    ok,
    status,
    json: async () => {
      throw new SyntaxError("Unexpected token < in JSON");
    },
    text: async () => "<html>Bad Gateway</html>",
  } as unknown as Response;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("synthesize", () => {
  test("skips the fast API and uses the free v3 flow when no key is configured", async () => {
    mockSafeFetch.mockImplementation(async (url) => {
      const href = String(url);
      if (href.includes("api.tts.quest/v3/voicevox/synthesis")) {
        return jsonResponse({ success: true, wavDownloadUrl: "https://download.example/a.wav" });
      }
      if (href.includes("download.example")) {
        return audioResponse([1, 2, 3]);
      }
      throw new Error(`unexpected url in test: ${href}`);
    });

    const result = await synthesize("hello", 3, null);

    expect(result.error).toBeUndefined();
    expect(result.audio).toEqual(Buffer.from([1, 2, 3]));
    expect(mockSafeFetch).not.toHaveBeenCalledWith(
      expect.stringContaining("deprecatedapis"),
      expect.anything(),
    );
  });

  test("uses the fast API and never touches the free v3 flow when it succeeds", async () => {
    mockSafeFetch.mockImplementation(async (url) => {
      const href = String(url);
      if (href.includes("deprecatedapis.tts.quest")) {
        return audioResponse([9, 9]);
      }
      throw new Error(`unexpected url in test: ${href}`);
    });

    const result = await synthesize("hello", 3, "fake-key");

    expect(result.audio).toEqual(Buffer.from([9, 9]));
    expect(mockSafeFetch).toHaveBeenCalledTimes(1);
  });

  test("falls back to the free v3 flow when the fast API fails", async () => {
    mockSafeFetch.mockImplementation(async (url) => {
      const href = String(url);
      if (href.includes("deprecatedapis.tts.quest")) {
        return jsonResponse({ errorMessage: "notEnoughPoints" }, false);
      }
      if (href.includes("api.tts.quest/v3/voicevox/synthesis")) {
        return jsonResponse({ success: true, wavDownloadUrl: "https://download.example/b.wav" });
      }
      if (href.includes("download.example")) {
        return audioResponse([4, 5]);
      }
      throw new Error(`unexpected url in test: ${href}`);
    });

    const result = await synthesize("hello", 3, "fake-key");

    expect(result.audio).toEqual(Buffer.from([4, 5]));
  });

  test("reports rate_limited when the v3 API reports failure without a retryAfter", async () => {
    mockSafeFetch.mockResolvedValue(jsonResponse({ success: false }));

    const result = await synthesize("hello", 3, null);

    expect(result.error).toBe("rate_limited");
  });

  test("reports api_error when the v3 request itself fails", async () => {
    mockSafeFetch.mockResolvedValue(new Error("network down"));

    const result = await synthesize("hello", 3, null);

    expect(result.error).toBe("api_error");
  });

  test("reports api_error instead of throwing when the v3 API returns a non-JSON error page", async () => {
    mockSafeFetch.mockResolvedValue(nonJsonResponse(false, 502));

    await expect(synthesize("hello", 3, null)).resolves.toEqual({ error: "api_error" });
  });

  test("reports timeout instead of throwing when status polling returns malformed responses", async () => {
    vi.useFakeTimers();
    try {
      mockSafeFetch.mockImplementation(async (url) => {
        const href = String(url);
        if (href.includes("api.tts.quest/v3/voicevox/synthesis")) {
          return jsonResponse({
            success: true,
            audioStatusUrl: "https://status.example/check",
            wavDownloadUrl: "https://download.example/c.wav",
          });
        }
        if (href.includes("status.example")) {
          return nonJsonResponse(true, 200);
        }
        throw new Error(`unexpected url in test: ${href}`);
      });

      const resultPromise = synthesize("hello", 3, null);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.error).toBe("timeout");
    } finally {
      vi.useRealTimers();
    }
  });
});
