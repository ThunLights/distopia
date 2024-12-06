import type { Guild } from "$lib/server/guild";

export const deDepulication = <T>(arr: T[]): T[] => Array.from(new Set(arr));

export function deDepulicationObject<T extends Guild>(arr: T[]): T[] {
	const result: T[] = [];
	for (const element of arr) {
		if (result.map(value => value.guildId).includes(element.guildId)) continue;
		result.push(element);
	}
	return result;
}

export function sumArrayContents(arr: number[]) {
	if (!arr.length) {
		return 0;
	}
	return arr.reduce((sum, element) => sum + element);
}
