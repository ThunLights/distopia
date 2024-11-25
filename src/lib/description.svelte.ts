import { CHARACTER_LIMIT } from "./constants.svelte";

export function descriptionFormatCheck(content: string) {
	return !(content.length > CHARACTER_LIMIT.description)
}
