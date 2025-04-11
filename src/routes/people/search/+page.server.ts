import { dedepulicationStructs } from "$lib/array";
import { database } from "$lib/server/Database/index";
import { blank } from "$lib/blank";

import type { PageServerLoad } from "./$types";
import type { Element } from "$lib/server/Database/DangerousPeople/index";
import { DangerousPeople } from "$lib/dangerousPeople";

export type Elements = Array<Element & { tags?: string[]; score?: number }>;

export const load = (async (e) => {
	const searchWord = e.url.searchParams.get("content") ?? "";
	const words = searchWord.split(/\s+/g);

	if (blank(searchWord)) {
		return {
			searchWord: decodeURIComponent(searchWord),
			elements: []
		};
	}

	let elements: Elements = [];

	for (const word of words) {
		elements = elements.concat(
			(await database.dangerousPeople.fetch(word, { partial: true })) ?? []
		);
		elements = elements.concat(await database.dangerousPeople.search(word));

		for (const userId of await database.dangerousPeople.tag.search(word)) {
			const user = await database.dangerousPeople.fetch(userId);
			if (user) {
				elements.push(user);
			}
		}
	}

	elements = dedepulicationStructs(elements);
	for (const element of elements) {
		const score = DangerousPeople.strArrToScore(
			await database.dangerousPeople.score.fetch(element.userId)
		);
		const tags = await database.dangerousPeople.tag.findUserTags(element.userId);

		element.score = score;
		element.tags = tags.map((value) => value.content);
	}

	return {
		searchWord: decodeURIComponent(searchWord),
		elements
	};
}) satisfies PageServerLoad;
