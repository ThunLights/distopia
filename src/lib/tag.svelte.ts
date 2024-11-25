import { CHARACTER_LIMIT, TAG_COUNT_LIMIT } from "./constants.svelte";

export function tagFormatCheck(content: string) {
	return !(content.length > CHARACTER_LIMIT.tag)
}

export function tagCountCheck<T>(content: T[]) {
	return !(content.length > TAG_COUNT_LIMIT);
}
