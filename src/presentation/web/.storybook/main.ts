import type { StorybookConfig } from "@storybook/sveltekit";
import dotenv from "dotenv";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const dotenvPath = join(process.cwd(), "../../../../.env");

if (existsSync(dotenvPath)) {
  dotenv.config({
    path: dotenvPath,
  });
}

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|ts|svelte)"],
  addons: [
    getAbsolutePath("@storybook/addon-svelte-csf"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  framework: getAbsolutePath("@storybook/sveltekit"),
  viteFinal: async (config) => {
    return defineConfig({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          // $env/dynamic/public only gets populated by SvelteKit's own request/server
          // lifecycle -- Storybook's static build never runs that lifecycle, so top-level
          // `env.PUBLIC_X` access in modules like $lib/shared/constant.ts throws
          // "Cannot read properties of undefined" for every story that transitively imports
          // it. Alias to the same static mock env.vitest.ts uses for Vitest-based runs.
          "$env/dynamic/public": join(
            dirname(fileURLToPath(import.meta.url)),
            "../src/mocks/env.storybook.ts",
          ),
        },
      },
      server: {
        ...config.server,
        watch: {
          usePolling: true,
          interval: 1500,
          binaryInterval: 5000,
        },
      },
    });
  },
};
export default config;
