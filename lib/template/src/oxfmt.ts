import type { OxfmtConfig } from "oxfmt";

export const config = {
  printWidth: 100,
  semi: true,
  useTabs: false,
  tabWidth: 2,
  singleQuote: false,
  trailingComma: "all",
  sortImports: true,
  ignorePatterns: ["*.auto.ts", "dist/**"],
} satisfies OxfmtConfig;
