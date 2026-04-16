import type { Handle } from "@sveltejs/kit";

export const handle = (async ({ event, resolve }) => {
  const response = await resolve(event);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  return response;
}) satisfies Handle;
