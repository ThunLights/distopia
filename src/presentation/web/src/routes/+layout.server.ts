import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (e) => {
  const user = e.locals.user;

  return { user };
};
