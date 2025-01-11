import { deDepulicationStructs } from "$lib/array";
import { database } from "$lib/server/Database/index";
import { blank } from "$lib/blank.svelte";

import type { PageServerLoad } from "./$types";
import type { Element } from "$lib/server/Database/DangerousPeople/index";

export type Elements = Array<Element & { tags?: string[] }>;

export const load = (async (e) => {
	const searchWord = e.url.searchParams.get("content") ?? "";
	const words = searchWord.split(/\s+/g);

	if (blank(searchWord)) {
		return {
			searchWord: decodeURIComponent(searchWord),
			elements: [],
		}
	}

	let elements: Elements = [];

	for (const word of words) {
		const search = {
			contains: word
		};

		elements = elements.concat(await database.dangerousPeople.fetch(word, { partial: true }) ?? []);
		elements = elements.concat(await database.dangerousPeople.search({
			name: search,
			title: search,
			description: search,
		}));

		for (const userId of await database.dangerousPeople.tag.search(word)) {
			const user = await database.dangerousPeople.fetch(userId);
			if (user) {
				elements.push(user);
			}
		}
	}

	elements = deDepulicationStructs(elements);
	for (const element of elements) {
		const tags = await database.dangerousPeople.tag.findUserTags(element.userId);
		element.tags = tags.map(value => value.content);
	}

	return {
		searchWord: decodeURIComponent(searchWord),
		elements,
	}
}) satisfies PageServerLoad;
