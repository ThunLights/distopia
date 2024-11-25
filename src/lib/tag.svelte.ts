import { CHARACTER_LIMIT } from "./constants.svelte";

export function tagFormatCheck(content: string) {
	return !(content.length > CHARACTER_LIMIT.tag)
}
