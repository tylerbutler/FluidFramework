import tailwindcss from "@tailwindcss/vite";
/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],

	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"],
	},
});
