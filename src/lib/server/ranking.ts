import { errorHandling } from "./error";

export type RankingElement = {
	guildId: string;
	content: bigint;
};

export type RankingElements = Array<RankingElement>;

export function parseRanking(guildId: string, elements: RankingElements) {
	try {
		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			if (element.guildId === guildId) {
				return i + 1;
			}
		}
		return null;
	} catch (error) {
		errorHandling(error);
		return null;
	}
}
