import { jsObf } from "@fjst/core";
import { fjstSvelteKit } from "@fjst/sveltekit";
import adapter from "@sveltejs/adapter-node";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
    runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true),
  },
  kit: {
    adapter: fjstSvelteKit(adapter(), [jsObf]),
    env: {
      dir: "../../../",
    },
  },
};

export default config;
