import { useAsync } from "./async";

export function omitTxtSync(content: string, maxLength: number): string {
  if (content.length < maxLength) {
    return content;
  }
  return content.substring(0, maxLength) + "...(省略)";
}

export const omitTxt = useAsync(omitTxtSync);
