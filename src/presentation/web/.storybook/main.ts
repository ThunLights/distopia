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
