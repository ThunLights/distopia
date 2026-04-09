import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/prelude.ts"],
  dts: true,
  format: ["esm", "cjs"],
  outDir: "dist",
});
