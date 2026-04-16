import { useAsync } from "./async";

export function isBlankSync(content: string): boolean {
  content = content.replaceAll("\n", "");
  content = content.replaceAll(/\s+/g, "");

  return content === "";
}

export const isBlank = useAsync(isBlankSync);
