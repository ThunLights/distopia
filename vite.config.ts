import { sveltekit } from '@sveltejs/kit/vite';
import { obfuscator } from 'rollup-obfuscator';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		obfuscator({
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
			deadCodeInjection: true,
			deadCodeInjectionThreshold: 1,
			stringArray: true,
			stringArrayEncoding: [ "rc4" ],
			stringArrayThreshold: 1,
        }),
	]
});
