import { core } from "$lib/server/core";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const friends = core.friend.sortedDatas;

  return {
    friends: friends.map(({ userId, username, description, nsfw, avatarUrl, tags }) => ({
      userId,
      username,
      description,
      nsfw,
      avatarUrl,
      tags,
    })),
  };
};
