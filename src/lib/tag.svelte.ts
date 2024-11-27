import { blank } from "./blank.svelte";
import { CHARACTER_LIMIT, INVALID_TAG_CHARACTOR, TAG_COUNT_LIMIT } from "./constants.svelte";

export function invalidCharactorChecker(content: string): boolean {
	const chars = content.split("");
	for (const char of chars) {
		if (INVALID_TAG_CHARACTOR.includes(char)) {
			return true;
		}
	}
	return false;
}

export function tagFormatCheck(content: string) {
	return content.length <= CHARACTER_LIMIT.tag && !blank(content) && !invalidCharactorChecker(content)
}

export function tagCountCheck<T>(content: T[]) {
	return !(content.length > TAG_COUNT_LIMIT);
}
