import { setToken } from "$lib/server/auth";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (e) => {
  const user = e.locals.user;

  if (user?.token) {
    await setToken(e.cookies, user.token);
  }

  return { user };
};
