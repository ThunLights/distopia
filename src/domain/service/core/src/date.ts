import { useAsync } from "./async";

export function formatYMDSync(date: Date) {
  return `${date.getUTCFullYear()}/${(date.getUTCMonth() + 1).toString().padStart(2, "0")}/${date.getUTCDate().toString().padStart(2, "0")}`;
}

export const formatYMD = useAsync(formatYMDSync);
