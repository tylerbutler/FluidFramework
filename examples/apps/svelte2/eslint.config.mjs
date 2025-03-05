import js from "@eslint/js";
import { includeIgnoreFile } from "@eslint/compat";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import { fileURLToPath } from "node:url";
import ts from "typescript-eslint";
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs["flat/recommended"],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,

				// Svelte recommends importing and specifying svelte.config.js. By doing so, some rules in eslint-plugin-svelte
        // will automatically read the configuration and adjust their behavior accordingly. While certain Svelte
        // settings may be statically loaded from svelte.config.js even if you don’t specify it, explicitly specifying
        // it ensures better compatibility and functionality.
				svelteConfig,
			},
		},
	},
);
