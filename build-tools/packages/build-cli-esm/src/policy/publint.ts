import { publint } from "publint";
// eslint-disable-next-line import/no-internal-modules
import { formatMessage } from "publint/utils";
import fs from "node:fs/promises";
import type { Handler, PackageJson } from "@fluidframework/build-tools";

const match = /(^|\/)package\.json/i;

export const publintHandler: Handler = {
	name: "npm-package-types-field",
	match,
	handler: async (file): Promise<string | undefined> => {
		const { messages } = await publint({
			/**
			 * Path to your package that contains a package.json file.
			 * Defaults to `process.cwd()` in node, `/` in browser.
			 */
			pkgDir: file,
			/**
			 * The level of messages to log (default: `'suggestion'`).
			 * - `suggestion`: logs all messages
			 * - `warning`: logs only `warning` and `error` messages
			 * - `error`: logs only `error` messages
			 */
			level: "warning",
			/**
			 * Report warnings as errors.
			 */
			strict: true,
		});

		const pkg = JSON.parse(await fs.readFile(file, "utf8")) as PackageJson;

		// for (const message of messages) {
		// 	// Prints default message in Node.js. Always a no-op in browsers.
		// 	// Useful for re-implementing the CLI in a programmatic way.
		// 	console.log(formatMessage(message, pkg));
		// }

		if (messages.length > 0) {
			return messages
				.map((message) => {
					return formatMessage(message, pkg);
				})
				.join("/n");
		}

		return undefined;
	},
};
