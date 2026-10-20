import { fetchVerifyClientScript } from "$lib/server/verifyPlugin";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";

// Companion of routes/immutable/chunks/[name].js -- same disguise, same rules.
export const GET: RequestHandler = async (e) => {
  if (!e.locals.user || !/^[\w-]{8}$/.test(e.params.name)) {
    return error(404, { message: "Not found" });
  }

  const bundle = await fetchVerifyClientScript();
  if (!bundle?.wasm) {
    return error(404, { message: "Not found" });
  }

  return new Response(Buffer.from(bundle.wasm, "base64"), {
    headers: { "Content-Type": "application/wasm", "Cache-Control": "no-store" },
  });
};
