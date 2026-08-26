// Referenced by bunfig.toml's `preload`, which runs before the module graph evaluates --
// this makes .env values available to $env/dynamic/* immune to import-sort reordering,
// unlike a literal `import "dotenv/config"` inside application source.
//
// Bun's own `preload` applies to *every* bun-invoked script in this directory, including
// `bun install`'s lifecycle hooks (e.g. the root package.json's `prepare: "husky"`) -- on a
// completely fresh `node_modules` (a Docker build's first `bun install`), dotenv itself
// isn't installed yet at that point, so a static `import "dotenv/config"` would fail
// install outright. A dynamic import inside try/catch defers resolution until it's actually
// needed and no-ops if it isn't available yet; the next real invocation (once `bun install`
// has finished) preloads normally.
try {
  await import("dotenv/config");
} catch {
  // dotenv not installed yet -- see above.
}
