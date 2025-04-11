import { blank } from "./blank";
import { CHARACTER_LIMIT } from "./constants";

export function descriptionFormatCheck(content: string): boolean {
	return !(content.length > CHARACTER_LIMIT.description) && !blank(content);
}
