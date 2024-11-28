import { sveltekit } from '@sveltejs/kit/vite';
import { obfuscator } from "rollup-obfuscator";
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		obfuscator(),
	]
});
