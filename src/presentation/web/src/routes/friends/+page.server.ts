import { core } from "$lib/server/core";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const friends = core.friend.sortedDatas;

  return {
    friends,
  };
};
