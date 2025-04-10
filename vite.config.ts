import { sveltekit } from "@sveltejs/kit/vite";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { obfuscator } from "rollup-obfuscator";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit(), enhancedImages(), obfuscator()]
});
