import type { Guild } from "$lib/server/guild";

export const dedepulication = <T>(arr: T[]): T[] => Array.from(new Set(arr));

export function dedepulicationObject<T extends Guild>(arr: T[]): T[] {
	const result: T[] = [];
	for (const element of arr) {
		if (result.map((value) => value.guildId).includes(element.guildId)) continue;
		result.push(element);
	}
	return result;
}

export function dedepulicationStructs<T extends object>(arr: T[]): T[] {
	const result: T[] = [];
	const stringElements: string[] = [];

	for (const element of arr) {
		const strElement = JSON.stringify(element);
		if (!stringElements.includes(strElement)) {
			result.push(element);
			stringElements.push(strElement);
		}
	}

	return result;
}

export function sumArrayContents(arr: number[]) {
	if (!arr.length) {
		return 0;
	}
	return arr.reduce((sum, element) => sum + element);
}
