
export function generateEdge(rank: number) {
	if (rank < 1) return 1;
	if (rank < 2) return 2;
	if (rank < 3) return 3;
	if (rank < 10) return 10;
	if (rank < 30) return 30;
	return 50;
}
