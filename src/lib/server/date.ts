export function formatDate(date: Date) {
	return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
}

export function getThirtyDaysAgo(date: Date) {
	date.setDate(date.getDate() - 30);
	return date;
}
