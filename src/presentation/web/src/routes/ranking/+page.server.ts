import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (e) => {
  const rankingType = e.url.searchParams.get("t");

  return {
    rankingType,
  };
};
