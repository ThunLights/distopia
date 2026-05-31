import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (e) => {
  const word = (() => {
    try {
      const word = e.url.searchParams.get("w");
      return word && decodeURIComponent(word);
    } catch {
      return null;
    }
  })();

  return {
    word,
  };
};
