import type { RequestHandler } from "./$types";
import { libDirPath } from "@qwik.dev/partytown/utils";
import { error } from "@sveltejs/kit";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Serves the @qwik.dev/partytown library files straight from the installed package instead of
// vite-plugin-partytown's default build-time copy into static output. That copy is served by
// adapter-node's own static file server, which never reaches hooks.server.ts -- so there was no
// way to override its default (uncached) response headers. Routing through SvelteKit here lets
// hooks.server.ts apply a long-lived Cache-Control instead, safe because the script tag in
// +layout.svelte appends the installed partytown version as a cache-busting query param.
export const GET: RequestHandler = async ({ params }) => {
  // Matches vite-plugin-partytown's own dev-middleware behavior: only the filename (last path
  // segment) is used to look up the library file, so an unexpected extra path segment can't
  // escape libDirPath()'s directory.
  const fileName = params.path.split("/").pop();

  if (!fileName || !fileName.endsWith(".js")) {
    error(404, "Not found");
  }

  const dir = libDirPath({ debugDir: params.path.includes("debug/") });

  try {
    const body = await readFile(join(dir, fileName));

    return new Response(body, {
      headers: {
        "content-type": "application/javascript; charset=utf-8",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    error(404, "Not found");
  }
};
