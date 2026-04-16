import { useAsync } from "./async";

export function compressTxtSync(content: string, compress: number): string {
  if (content.length < compress) {
    return content;
  }
  return content.substring(0, compress) + "...(省略)";
}

export const compressTxt = useAsync(compressTxtSync);
