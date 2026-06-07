import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  format: ["esm", "cjs"],
  tsconfig: "tsconfig.json",
  clean: true,
  deps: {
    alwaysBundle: ["distopia-template"],
  },
});
