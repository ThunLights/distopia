import { fetchVerifyClientScript } from "$lib/server/verifyPlugin";
import type { RequestHandler } from "./$types";

// Fetched from the optional, private VerifyService over RPC (see lib/server/verifyPlugin.ts)
// rather than imported directly -- the browser has no way to run server-side code, so this
// endpoint just relays the raw JS source for the page (lib/client/verify.ts) to import as a
// Blob URL. 404 when no private verify service is configured; the page treats that
// identically to "no plugin".
export const GET: RequestHandler = async () => {
  const code = await fetchVerifyClientScript();
  if (!code) {
    return new Response(null, { status: 404 });
  }

  return new Response(code, { headers: { "Content-Type": "text/javascript" } });
};
