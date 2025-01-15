
export type Element = {
	id: string
	score: number
	label: string
}

export type Elements = Array<Element>;

export class DangerousPeople {
	public static readonly table = {
		disturber: 10,
		situationBreaker: 15,
		sexualHarassment: 20,
		madman: 30,
		internetStalker: 40,
		criminal: 50,
		disturberNukeBot: 50,
		disturberSelfBot: 60,
		disturberStaff: 65,
		criminalStaff: 80,
	} as Record<string, number>;

	public static readonly displayContent = {
		disturber: "荒らし",
		situationBreaker: "空気が読めない",
		sexualHarassment: "セクハラ",
		madman: "話が通じない",
		internetStalker: "ネトスト",
		criminal: "犯罪者",
		disturberNukeBot: "荒らし(NukeBot)",
		disturberSelfBot: "荒らし(SelfBot)",
		disturberStaff: "荒らし(幹部)",
		criminalStaff: "犯罪者(幹部)",
	} as Record<string, string>;

	public static propertyToContent(content: string) {
		return this.displayContent[content] ?? "その他";
	}

	public static elementsList(): Elements {
		return Object.entries(DangerousPeople.table)
			.map(([id, score]) => {return {
				id, score, label: DangerousPeople.propertyToContent(id),
			}});
	}

	public static strToScore(content: string) {
		return DangerousPeople.table[content] ?? 0;
	}

	public static strArrToScore(arr: string[]) {
		let result = 0;
		for (const word of arr) {
			result += this.strToScore(word);
		}
		return result;
	}
}
