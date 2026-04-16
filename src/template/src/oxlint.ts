import { defineConfig } from "oxlint";

export const config = defineConfig({
  plugins: ["typescript", "unicorn", "oxc"],
  categories: {
    correctness: "error",
  },
  rules: {},
  env: {
    builtin: true,
  },
});
