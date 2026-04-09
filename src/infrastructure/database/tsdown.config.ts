import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/zod/index.ts", "src/prisma.ts"],
  dts: true,
  format: ["esm", "cjs"],
  outDir: "dist",
});
