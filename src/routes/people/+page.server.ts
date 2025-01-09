
import { database } from "$lib/server/Database";
import type { PageServerLoad } from "./$types";

export const load = (async (e) => {
	const pageQuery = Number(e.url.searchParams.get("page") ?? "0");
	const page = pageQuery > 0 ? pageQuery : 1;
	const peoples = await database.dangerousPeople.findMany(page -1);

	const elementsTag: Record<string, string[]> = {};
	for (const element of peoples) {
		elementsTag[element.userId] = (await database.dangerousPeople.tag.findUserTags(element.userId)).map(value => value.content);
	}

	return {
		count: await database.dangerousPeople.countAll(),
		peoples: peoples.map(value => {return {
			...value,
			...{
				tags: elementsTag[value.userId] ?? [],
			}
		}})
	}
}) satisfies PageServerLoad;
