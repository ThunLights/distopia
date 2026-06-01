import { useAsync } from "./async";

export function omitTxtSync(content: string, maxLength: number): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength) + "...(省略)";
}

export const omitTxt = useAsync(omitTxtSync);

export function omitLineSync(content: string, maxLine: number): string {
  const lines = content.split("\n");
  if (lines.length <= maxLine) {
    return content;
  }
  return [...lines.slice(0, maxLine), "(以下省略)"].join("\n");
}

export const omitLine = useAsync(omitLineSync);
