export class Day {
  public static readonly days = [
    "日曜日",
    "月曜日",
    "火曜日",
    "水曜日",
    "木曜日",
    "金曜日",
    "土曜日",
  ];

  public static async exchange(date: Date): Promise<string> {
    return this.days[date.getDay()] as string;
  }

  public static async exchangeAbbreviation(date: Date) {
    return (await this.exchange(date)).charAt(0);
  }
}
