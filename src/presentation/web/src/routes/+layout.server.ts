import { dependencies } from "../../package.json";
import type { LayoutServerLoad } from "./$types";

const partytownVersion = dependencies["@qwik.dev/partytown"];

export const load: LayoutServerLoad = async (e) => {
  const user = e.locals.user;

  return { user, partytownVersion };
};
