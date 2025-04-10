export class DayExchanger {
	public static readonly days = [
		"日曜日",
		"月曜日",
		"火曜日",
		"水曜日",
		"木曜日",
		"金曜日",
		"土曜日"
	];
	public static exchange(date: Date): string {
		return this.days[date.getDay()];
	}
	public static exchangeAbbreviation(date: Date) {
		return this.days[date.getDay()].charAt(0);
	}
}
