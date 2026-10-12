// Mirrors each real plugin package under root plugin/ (standalone, not part of this workspace
// -- see plugin/.fingerprint's own package.json) into
// src/presentation/verify/plugins/<name>/, stripping the leading dot. The dot-prefix is
// exactly what makes infra-verify's loadPluginFolder skip the folder it's copied *from* (so
// plugin/ stays safe to browse); stripping it on the way in is what activates the copy for
// local dev -- Bun resolves a bare directory import straight to its index.ts with no
// package.json needed. EXAMPLE_NAMES are the inert samples this repo ships in plugin/ itself
// (mirrors src/presentation/verify/plugins/.fingerprint and .anti-scraping) -- never sync
// those, only a real plugin you've added alongside them.
//
// Only .ts source files are copied -- never package.json, tsconfig.json, lockfiles, or
// node_modules -- so a plugin can still reference sibling files (e.g. index.ts bundling its
// own client.ts) while no package.json ever lands under src/**/*, which bun's own workspace
// glob would otherwise pick up as a (bogus) extra workspace member on the next `bun install`
// at the repo root. The destination is .gitignored (see .gitignore) so a real, private plugin
// synced here never ends up in a commit.
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { basename, join } from "node:path";

const EXAMPLE_NAMES = new Set([".fingerprint", ".anti-scraping"]);
const EXCLUDED_BASENAMES = new Set([
  "node_modules",
  "package.json",
  "package-lock.json",
  "bun.lock",
  "tsconfig.json",
]);

const ROOT = join(import.meta.dirname, "..");
const SOURCE_DIR = join(ROOT, "plugin");
const DEST_DIR = join(ROOT, "src/presentation/verify/plugins");

await mkdir(DEST_DIR, { recursive: true });

const entries = await readdir(SOURCE_DIR, { withFileTypes: true });

for (const entry of entries) {
  if (!entry.isDirectory() || !entry.name.startsWith(".") || EXAMPLE_NAMES.has(entry.name)) {
    continue;
  }

  const name = entry.name.slice(1);
  const dest = join(DEST_DIR, name);
  await rm(dest, { recursive: true, force: true });
  await cp(join(SOURCE_DIR, entry.name), dest, {
    recursive: true,
    filter: (src) => !EXCLUDED_BASENAMES.has(basename(src)),
  });
  console.log(`synced plugin/${entry.name} -> src/presentation/verify/plugins/${name}/`);
}
