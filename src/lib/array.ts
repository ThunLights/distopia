
export const deDepulication = <T>(arr: T[]): T[] => Array.from(new Set(arr));

export function sumArrayContents(arr: number[]) {
	if (!arr.length) {
		return 0;
	}
	return arr.reduce((sum, element) => sum + element);
}
