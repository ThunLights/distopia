import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (e) => {
  const word = e.url.searchParams.get("w");

  return {
    word: word ? decodeURIComponent(word) : null,
  };
};
