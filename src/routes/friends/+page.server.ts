import { database } from "$lib/server/Database/index";

import type { PageServerLoad } from "./$types";

export const load = (async (e) => {
	const pageQuery = Number(e.url.searchParams.get("page") ?? "0");
	const page = pageQuery > 0 ? pageQuery : 1;
	const friends = await database.friend.findMany(page - 1);

	const elementsAvatar: Record<
		string,
		{
			username: string;
			time: bigint;
			id: string;
			accessToken: string;
			refreshToken: string;
			email: string | null;
			avatar: string | null;
			bumpCounter: number | null;
		} | null
	> = {};
	const elementsTag: Record<string, string[]> = {};
	for (const element of friends) {
		elementsAvatar[element.userId] = await database.user.data(element.userId);
		elementsTag[element.userId] = (await database.friend.tag.findUserTags(element.userId)).map(
			(value) => value.content
		);
	}

	return {
		page,
		friends: friends.map((value) => {
			const avatar = elementsAvatar[value.userId];
			return {
				...value,
				...{
					avatar: avatar ? avatar.avatar : null,
					tags: elementsTag[value.userId] ?? []
				}
			};
		})
	};
}) satisfies PageServerLoad;
