
export namespace dayExchanger {
    export const days = [
        "日曜日",
        "月曜日",
        "火曜日",
        "水曜日",
        "木曜日",
        "金曜日",
        "土曜日",
    ]
    export function exchange(date:Date):string {
        return days[date.getDay()]
    }
    export function exchangeAbbreviation(date:Date) {
        return (days[date.getDay()]).charAt(0)
    }
}
