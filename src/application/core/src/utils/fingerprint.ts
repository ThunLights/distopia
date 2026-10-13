import { createHash } from "node:crypto";

import z from "zod";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// Recursive, so it needs an explicit type annotation to break the circular inference --
// z.lazy defers evaluation until parse time, which is also what makes the self-reference
// possible at all.
const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
);

// Validates that an untrusted fingerprint payload (POSTed by the browser, see
// routes/api/verify/+server.ts) is actually a well-formed JSON value before it's hashed or
// stored -- the specific shape inside stays entirely up to whatever the (optional, private)
// VerifyClientPlugin's collect() returned, this only guards the trust boundary.
export const FingerprintSchema = z.compile(JsonValueSchema);

// Sorts object keys recursively so the same logical value hashes identically regardless of
// what order the browser-side plugin happened to build its object in.
function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  return `{${entries.map(([key, val]) => `${JSON.stringify(key)}:${canonicalize(val)}`).join(",")}}`;
}

function hashEntry(key: string, value: unknown): string {
  return createHash("sha256")
    .update(`${key}:${canonicalize(value)}`)
    .digest("hex");
}

// A (private) VerifyClientPlugin may combine multiple independent signals in one collect()
// result -- e.g. thunlights/discord-verify's own fingerprintjs/canvas/gpu split. Hashing each
// top-level signal separately (rather than one hash for the whole object) means two accounts
// that share just one signal (say, the same GPU) while differing on the rest still match on
// that signal -- a single combined hash would never match unless every signal agreed.
// Non-object fingerprints (a bare string/number) hash as a single "value" entry.
export function fingerprintHashes(fingerprint: unknown): string[] {
  if (fingerprint === null || fingerprint === undefined) {
    return [];
  }
  if (typeof fingerprint === "object" && !Array.isArray(fingerprint)) {
    return Object.entries(fingerprint as Record<string, unknown>).map(([key, value]) =>
      hashEntry(key, value),
    );
  }
  return [hashEntry("value", fingerprint)];
}
