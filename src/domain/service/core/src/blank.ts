import { useAsync } from "./async";

export function isBlankSync(content: string): boolean {
  return content.trim().replaceAll("\n", "").replaceAll(/\s+/g, "") === "";
}

export const isBlank = useAsync(isBlankSync);
