import { useAsync } from "domain-service";

export function formatYMDStringSync(date: Date) {
  return `${date.getUTCFullYear()}/${(date.getUTCMonth() + 1).toString().padStart(2, "0")}/${date.getUTCDate().toString().padStart(2, "0")}`;
}

export const formatYMDString = useAsync(formatYMDStringSync);

export function formatYMDSync(date: Date) {
  return new Date(formatYMDStringSync(date));
}

export const formatYMD = useAsync(formatYMDSync);
