import { setToken, verifyToken } from "$lib/server/auth";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (e) => {
  const user = await verifyToken(e.cookies);

  if (user?.token) {
    await setToken(e.cookies, user.token);
  }

  return { user };
};
