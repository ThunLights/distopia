
export type Meridiem = "AM" | "PM";

export function getMeridiem(timezone: string, d?: Date): Meridiem {
    const date = new Date((d ?? new Date()).toLocaleString(timezone));
    return (date.getHours() % 12) >= 12 ? "AM" : "PM";
}
