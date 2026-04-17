import { type Handle, type HandleServerError } from "@sveltejs/kit";

export const handle = (async ({ event, resolve }) => {
  const response = await resolve(event);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  return response;
}) satisfies Handle;

export const handleError = (async (input) => {
  if (input.status === 404) {
    return { message: "Page Not found" };
  }
  if (input.status === 405) {
    return { message: "Method Not Allowed" };
  }
}) satisfies HandleServerError;
