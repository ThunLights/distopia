import { blank } from "./blank.svelte";
import { CHARACTER_LIMIT } from "./constants.svelte";

export function descriptionFormatCheck(content: string) {
	return !(content.length > CHARACTER_LIMIT.description) && !blank(content)
}
