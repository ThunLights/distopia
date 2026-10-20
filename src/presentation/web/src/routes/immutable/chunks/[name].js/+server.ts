import { fetchVerifyClientScript } from "$lib/server/verifyPlugin";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";

// Deliberately shaped like a SvelteKit build chunk (SvelteKit itself reserves /_app, so this
// can't live under it) so the verify client plugin doesn't stand out among the page's scripts.
// The name is random per page load and carries no meaning; any well-formed name serves the script.
export const GET: RequestHandler = async (e) => {
  if (!e.locals.user || !/^[\w-]{8}$/.test(e.params.name)) {
    return error(404, { message: "Not found" });
  }

  const bundle = await fetchVerifyClientScript();
  if (!bundle) {
    return error(404, { message: "Not found" });
  }

  return new Response(bundle.code, {
    headers: { "Content-Type": "text/javascript", "Cache-Control": "no-store" },
  });
};
