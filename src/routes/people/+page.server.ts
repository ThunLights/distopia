import { DangerousPeople } from "$lib/dangerousPeople";
import { database } from "$lib/server/Database/index";

import type { PageServerLoad } from "./$types";

export const load = (async (e) => {
	const pageQuery = Number(e.url.searchParams.get("page") ?? "0");
	const page = pageQuery > 0 ? pageQuery : 1;
	const peoples = await database.dangerousPeople.findMany(page -1);

	const elementsScore: Record<string, number> = {};
	const elementsTag: Record<string, string[]> = {};
	const elementsSubAccounts: Record<string, string[]> = {};

	for (const element of peoples) {
		elementsScore[element.userId] = DangerousPeople.strArrToScore(await database.dangerousPeople.score.fetch(element.userId));
		elementsTag[element.userId] = (await database.dangerousPeople.tag.findUserTags(element.userId)).map(value => value.content);
		elementsSubAccounts[element.userId] = (await database.dangerousPeople.subAccount.fetch(element.userId)).map(value => value.userId);
	}

	return {
		count: await database.dangerousPeople.countAll(),
		peoples: peoples.map(value => {return {
			...value,
			...{
				score: elementsScore[value.userId] ?? 0,
				tags: elementsTag[value.userId] ?? [],
				subAccounts: elementsSubAccounts[value.userId] ?? [],
			}
		}})
	}
}) satisfies PageServerLoad;
