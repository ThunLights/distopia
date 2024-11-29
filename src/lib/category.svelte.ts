
export type Category = {
	id: string
	name: string
}

export const CATEGORIES = [
	{
		id: "game",
		name: "ゲーム",
	},
	{
		id: "community",
		name: "コミュニティ",
	},
	{
		id: "anime",
		name: "アニメ",
	},
	{
		id: "comic",
		name: "漫画",
	},
	{
		id: "music",
		name: "音楽",
	},
	{
		id: "technology",
		name: "技術",
	},
	{
		id: "language",
		name: "言語",
	},
	{
		id: "movie",
		name: "映画",
	},
	{
		id: "other",
		name: "その他",
	}
] satisfies Array<Category>;

export function foundCategory(content: string): boolean {
	return CATEGORIES.map(value => value.id).includes(content);
}

export function getCategory(content: string): string | null {
	for (const category of CATEGORIES) {
		if (category.id === content) {
			return category.name;
		}
	}
	return null;
}
