/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { mdsvex } from "mdsvex";
// import adapter from "@sveltejs/adapter-node";
// import staticAdapter from "@sveltejs/adapter-static";
import netlifyAdapter from "@sveltejs/adapter-netlify";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// @ts-check

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],

	kit: {
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: netlifyAdapter(),
		// adapter: staticAdapter(),
		files: {
			lib: "src/library",
		},
	},
	extensions: [".svelte", ".svx"],
};

export default config;
