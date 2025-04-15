import { dedepulicationStructs } from "$lib/array";
import { blank } from "$lib/blank";
import { DPDB } from "$lib/dangerousPeople";

import type { PageServerLoad } from "./$types";
import type { Element } from "$lib/server/Database/DangerousPeople/index";
import type { DPDBFormat } from "$lib/dangerousPeople";

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

	const elements: DPDBFormat = [];

	for (const data of DPDB) {
		const { userId } = data;
		if (words.includes(userId)) {
			elements.push(data);
			continue;
		}
		for (const word of words) {
			if (
				data.name.includes(word) ||
				data.title.includes(word) ||
				data.description.includes(word) ||
				data.tags.includes(word)
			) {
				elements.push(data);
				continue;
			}
		}
	}

	return {
		searchWord: decodeURIComponent(searchWord),
		elements: dedepulicationStructs(elements)
	};
}) satisfies PageServerLoad;
