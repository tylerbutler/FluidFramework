import { PackageCommand, PackageKind } from "@fluid-tools/build-cli";
import { Package } from "@fluidframework/build-tools";
import chalk from "chalk";
import { publint } from "publint";
// eslint-disable-next-line import/no-internal-modules
import { formatMessage } from "publint/utils";

export default class CheckPostbuildCommand extends PackageCommand<typeof CheckPostbuildCommand> {
	protected async processPackage(pkg: Package, kind: PackageKind): Promise<void> {
		const { messages } = await publint({
			/**
			 * Path to your package that contains a package.json file.
			 * Defaults to `process.cwd()` in node, `/` in browser.
			 */
			pkgDir: pkg.directory,
			/**
			 * The level of messages to log (default: `'suggestion'`).
			 * - `suggestion`: logs all messages
			 * - `warning`: logs only `warning` and `error` messages
			 * - `error`: logs only `error` messages
			 */
			level: "suggestion",
			/**
			 * Report warnings as errors.
			 */
			strict: true,
		});

		// const pkg = JSON.parse(await fs.readFile(file, "utf8")) as PackageJson;

		if (messages.length > 0) {
			this.log(chalk.green.bold(pkg.nameColored));
		}
		for (const message of messages) {
			// Prints default message in Node.js. Always a no-op in browsers.
			// Useful for re-implementing the CLI in a programmatic way.
			this.log(formatMessage(message, pkg.packageJson));
		}
	}
}
