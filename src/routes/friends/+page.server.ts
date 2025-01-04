import { database } from "$lib/server/Database/index";

import type { PageServerLoad } from "./$types"

export const load = (async (e) => {
	const pageQuery = Number(e.url.searchParams.get("page") ?? "0");
	const page = pageQuery > 0 ? pageQuery : 1;
	const friends = await database.friend.findMany(page -1);

	const elementsAvatar: Record<string, string | null> = {};
	const elementsTag: Record<string, string[]> = {};
	for (const element of friends) {
		elementsAvatar[element.userId] = await database.avatar.data(element.userId);
		elementsTag[element.userId] = (await database.friend.tag.findUserTags(element.userId)).map(value => value.content);
	}

	return {
		page,
		friends: friends.map(value => {return {
			...value,
			...{
				avatar: elementsAvatar[value.userId] ?? null,
				tags: elementsTag[value.userId] ?? [],
			},
		}}),
	}
}) satisfies PageServerLoad;
