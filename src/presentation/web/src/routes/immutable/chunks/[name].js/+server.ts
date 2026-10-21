import { fetchVerifyClientScript } from "$lib/server/verifyPlugin";
import { hasPluginGrant } from "$lib/server/verifyPluginGrant";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";

// Deliberately shaped like a SvelteKit build chunk (SvelteKit itself reserves /_app, so this
// can't live under it) so the verify client plugin doesn't stand out among the page's scripts.
// The name is random per page load and only served to the user it was issued to (see
// verifyPluginGrant.ts), so the script is gated by the verify page's own guild checks.
export const GET: RequestHandler = async (e) => {
  if (!e.locals.user || !(await hasPluginGrant(e.params.name, e.locals.user.id))) {
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
