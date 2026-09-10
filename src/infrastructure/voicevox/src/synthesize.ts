import { safeFetch, safeUrl, validateSafeUrl } from "infra-http";

// VOICEVOX TTS Quest -- https://voicevox.su-shiki.com/su-shikiapis/ttsquest/
// No API key required. Synthesis is asynchronous: the initial response only hands back status/
// download URLs, and audioStatusUrl must be polled until isAudioReady before the download URLs
// are actually fetchable.
//
// A separate, faster endpoint exists (https://voicevox.su-shiki.com/su-shikiapis/, "高速API")
// that requires a paid API key: unlike the v3 API above, it's synchronous (the response body
// *is* the audio, no polling) and consumes a points balance per request. Confirmed live against
// the real API: success is 200 with Content-Type audio/x-wav; any failure (invalid key, no
// points left, etc.) is a non-200 JSON body like {"errorMessage": "notEnoughPoints"}. Tried
// first when a key is configured; any failure there (including running out of points) falls
// back to the free v3 flow below rather than surfacing an error, so TTS keeps working either way.
const MAX_SYNTHESIS_RETRIES = 3;
const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 1500;

type SynthesisResponse = {
  success: boolean;
  audioStatusUrl?: string;
  mp3DownloadUrl?: string;
  wavDownloadUrl?: string;
  retryAfter?: number;
};

type AudioStatusResponse = {
  isAudioReady: boolean;
};

export type TtsSynthesisResult =
  | { audio: Buffer; error?: undefined }
  | { audio?: undefined; error: "rate_limited" | "api_error" | "timeout" };

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

// Free, unauthenticated, shared API -- serialize every synthesis request process-wide so
// concurrent guilds reading aloud at once don't trip its own rate limit against each other.
let queue: Promise<unknown> = Promise.resolve();

function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function synthesize(
  text: string,
  speakerId: number,
  apiKey: string | null,
): Promise<TtsSynthesisResult> {
  return serialize(() => synthesizeNow(text, speakerId, apiKey));
}

async function synthesizeFast(
  text: string,
  speakerId: number,
  apiKey: string | null,
): Promise<Buffer | null> {
  if (!apiKey) {
    return null;
  }

  // No interpolation here on purpose -- safeUrl encodeURIComponent's every interpolated
  // value, which would mangle the literal URL itself if it were substituted in.
  const url = safeUrl`https://deprecatedapis.tts.quest/v2/voicevox/audio/`;
  const response = await safeFetch(url, {
    method: "POST",
    body: new URLSearchParams({ key: apiKey, text, speaker: String(speakerId) }),
  });

  if (response instanceof Error || !response.ok) {
    if (!(response instanceof Error)) {
      // Best-effort only -- a failure response isn't guaranteed to be the documented
      // {"errorMessage": "..."} shape, and this is purely for observability.
      console.error("[voicevox] fast API unavailable, falling back to the free API", {
        status: response.status,
        body: await response.text().catch(() => undefined),
      });
    }
    return null;
  }

  return Buffer.from(await response.arrayBuffer());
}

async function synthesizeNow(
  text: string,
  speakerId: number,
  apiKey: string | null,
): Promise<TtsSynthesisResult> {
  const fastAudio = await synthesizeFast(text, speakerId, apiKey);
  if (fastAudio) {
    return { audio: fastAudio };
  }

  // No interpolation here on purpose -- safeUrl encodeURIComponent's every interpolated
  // value, which would mangle the literal URL itself if it were substituted in.
  const url = safeUrl`https://api.tts.quest/v3/voicevox/synthesis`;

  for (let attempt = 0; attempt < MAX_SYNTHESIS_RETRIES; attempt++) {
    const response = await safeFetch(url, {
      method: "POST",
      body: new URLSearchParams({ text, speaker: String(speakerId) }),
    });
    if (response instanceof Error) {
      return { error: "api_error" };
    }

    const body = (await response.json()) as SynthesisResponse;
    if (!body.success) {
      const isLastAttempt = attempt === MAX_SYNTHESIS_RETRIES - 1;
      if (typeof body.retryAfter === "number" && !isLastAttempt) {
        await sleep(body.retryAfter * 1000);
        continue;
      }
      return { error: "rate_limited" };
    }

    const downloadUrl = body.mp3DownloadUrl ?? body.wavDownloadUrl;
    const safeDownloadUrl = downloadUrl ? validateSafeUrl(downloadUrl) : null;
    if (!safeDownloadUrl) {
      return { error: "api_error" };
    }

    const ready = await pollUntilReady(body.audioStatusUrl);
    if (!ready) {
      return { error: "timeout" };
    }

    // Fetched here (not left as a URL for the caller to fetch/hand to FFmpeg) so the actual
    // network request always goes through safeFetch's SSRF protections, even though this
    // download host normally comes from the API's own trusted response.
    const audioResponse = await safeFetch(safeDownloadUrl);
    if (audioResponse instanceof Error) {
      return { error: "api_error" };
    }

    return { audio: Buffer.from(await audioResponse.arrayBuffer()) };
  }

  return { error: "rate_limited" };
}

async function pollUntilReady(statusUrl: string | undefined): Promise<boolean> {
  if (!statusUrl) {
    return true;
  }

  const safeStatusUrl = validateSafeUrl(statusUrl);
  if (!safeStatusUrl) {
    return false;
  }

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const response = await safeFetch(safeStatusUrl);
    if (!(response instanceof Error)) {
      const status = (await response.json()) as AudioStatusResponse;
      if (status.isAudioReady) {
        return true;
      }
    }
    await sleep(POLL_INTERVAL_MS);
  }
  return false;
}
