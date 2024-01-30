/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

const fluidInternal = require("eslint-plugin-fluid-internal");
const prettierPlugin = require("eslint-config-prettier");

module.exports = [
	prettierPlugin,
	{
		plugins: {
			"eslint-plugin-fluid-internal": fluidInternal,
		},
		languageOptions: {
			parserOptions: {
				project: ["./tsconfig.json", "./src/test/tsconfig.json"],
			},
		},
		rules: {
			"@typescript-eslint/no-use-before-define": "off",
			"@typescript-eslint/strict-boolean-expressions": "off",

			// TODO: consider re-enabling once we have addressed how this rule conflicts with our error codes.
			"unicorn/numeric-separators-style": "off",
		},
	},
	{
		files: ["src/test/**"],
		rules: {
			// Allow tests (which only run in Node.js) use `__dirname`
			"unicorn/prefer-module": "off",
		},
	},
];
