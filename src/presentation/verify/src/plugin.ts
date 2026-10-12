import { join } from "node:path";

import type { VerifyServerPlugin } from "distopia";
import { loadPluginFolder } from "infra-verify";

// Resolved relative to this file rather than process.cwd() so it's correct regardless of
// where the process is started from. See ../plugins/.fingerprint and
// ../plugins/.anti-scraping for the expected shape of a real (non-dot-prefixed) plugin file
// -- in production, a Kubernetes Secret volume mounted at this same path (see
// k8s/app/verify-deployment.yaml) replaces its contents with the real, private ones.
const DEFAULT_PLUGIN_DIR = join(import.meta.dirname, "../plugins");
const PLUGIN_DIR = process.env.VERIFY_PLUGIN_DIR ?? DEFAULT_PLUGIN_DIR;

let cached: VerifyServerPlugin | null | undefined;

async function getPlugin(): Promise<VerifyServerPlugin | null> {
  if (cached === undefined) {
    cached = await loadPluginFolder(PLUGIN_DIR);
  }
  return cached;
}

export async function evaluate(input: {
  guildId: string;
  userId: string;
  extra: unknown;
  headers: Record<string, string>;
}): Promise<boolean> {
  const plugin = await getPlugin();
  if (!plugin) {
    return true; // no plugin files in the folder -- nothing extra to check
  }
  try {
    return await plugin.evaluate(input);
  } catch {
    return false; // plugin present but threw -- fail closed
  }
}

export async function getClientScript(): Promise<string> {
  const plugin = await getPlugin();
  if (!plugin) {
    return "";
  }
  try {
    return (await plugin.getClientScript()) ?? "";
  } catch {
    return "";
  }
}

export async function decryptBody(encrypted: string): Promise<string | null> {
  const plugin = await getPlugin();
  if (!plugin) {
    return null;
  }
  try {
    return await plugin.decryptBody(encrypted);
  } catch {
    return null;
  }
}
