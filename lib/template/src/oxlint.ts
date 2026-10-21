import type { OxlintConfig } from "oxlint";

export const config = {
  plugins: ["typescript", "unicorn", "oxc"],
  categories: {
    correctness: "error",
  },
  rules: {},
  env: {
    builtin: true,
  },
  ignorePatterns: ["*.auto.ts", "dist/**"],
} satisfies OxlintConfig;
