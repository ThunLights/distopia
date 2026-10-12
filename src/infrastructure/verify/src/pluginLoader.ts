import { readdir } from "node:fs/promises";
import { join } from "node:path";

import type { VerifyServerPlugin } from "distopia";
import { obfuscate } from "infra-js-obf";

// Each file in the plugin folder may implement any subset of VerifyServerPlugin -- e.g. one
// file only cares about fingerprinting (evaluate), another only about body obfuscation
// (decryptBody). loadPluginFolder below combines whatever it finds into one full
// VerifyServerPlugin.
type VerifyPluginSlot = Partial<VerifyServerPlugin>;

/**
 * Loads every non-hidden file directly inside `dir` as an independent plugin module and
 * merges them into a single {@link VerifyServerPlugin}:
 * - `evaluate`: every loaded module that defines it must agree (AND) -- any one plugin file
 *   can veto verification.
 * - `getClientScript`: the first loaded module that defines it "wins" -- only one browser
 *   script is served at a time (ponytail: merging multiple client scripts into one importable
 *   module would need a shared export contract between files; add that if you actually need
 *   more than one contributing browser-side code). Its result is obfuscated and cached for
 *   the life of this loaded plugin set -- individual plugin files return plain JS source and
 *   don't need to obfuscate or cache it themselves.
 * - `decryptBody`: likewise, the first module that defines it wins -- only one cipher scheme
 *   is expected to be active at a time.
 *
 * Dot-prefixed entries (e.g. `.fingerprint`, `.anti-scraping`) are always skipped -- this
 * repo ships those as inert samples showing the expected shape; copy one to a non-dot
 * filename (and implement it for real) to activate it.
 *
 * Returns `null` if `dir` doesn't exist or no file in it could be loaded as a plugin.
 */
export async function loadPluginFolder(dir: string): Promise<VerifyServerPlugin | null> {
  let entries: string[];
  try {
    // Sorted so "first match wins" (getClientScript/decryptBody) is deterministic regardless
    // of the OS/filesystem's own directory-entry order.
    entries = (await readdir(dir)).filter((name) => !name.startsWith(".")).sort();
  } catch {
    return null;
  }

  const modules: VerifyPluginSlot[] = [];
  for (const entry of entries) {
    try {
      const mod = (await import(join(dir, entry))) as { default: VerifyPluginSlot };
      modules.push(mod.default);
    } catch {
      // Unreadable/invalid plugin file -- skip it rather than failing the whole folder.
    }
  }

  if (modules.length === 0) {
    return null;
  }

  // getClientScript takes no per-request input, so its result is the same for every caller
  // until the next restart -- compute and obfuscate it once and reuse that, instead of
  // redoing both on every request. Cache the promise itself (not just its resolution) so
  // concurrent first callers share one in-flight computation rather than racing.
  let clientScriptCache: Promise<string | null> | undefined;

  return {
    async evaluate(input) {
      for (const mod of modules) {
        if (mod.evaluate && !(await mod.evaluate(input))) {
          return false;
        }
      }
      return true;
    },

    getClientScript() {
      clientScriptCache ??= (async () => {
        for (const mod of modules) {
          if (mod.getClientScript) {
            const script = await mod.getClientScript();
            if (script) {
              return obfuscate(script);
            }
          }
        }
        return null;
      })();
      return clientScriptCache;
    },

    async decryptBody(encrypted) {
      for (const mod of modules) {
        if (mod.decryptBody) {
          return await mod.decryptBody(encrypted);
        }
      }
      return null;
    },
  };
}
