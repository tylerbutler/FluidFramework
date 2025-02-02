import type { MonoRepo, Package } from "@fluidframework/build-tools";
import chalk from "picocolors";
import type { Context } from "../../context.js";
import type { CheckResult, CheckFunction } from "../../releasePrepChecks.js";
import type { CommandLogger } from "../../../logging.js";

export async function runChecks(
	context: Context,
	pkgOrReleaseGroup: MonoRepo | Package,
	checks: ReadonlyMap<string, CheckFunction>,
): Promise<Map<string, CheckResult>> {
	const results: Map<string, CheckResult> = new Map();
	for (const [name, check] of checks) {
		// eslint-disable-next-line no-await-in-loop -- the checks are supposed to run serially
		const checkResult = await check(context, pkgOrReleaseGroup);
		results.set(name, checkResult);
	}
	return results;
}

export function reportResult(name: string, checkResult: CheckResult, log: CommandLogger): void {
	const checkPassed = checkResult === undefined;
	const icon = checkPassed
		? chalk.bgGreen(chalk.black(" ✔︎ "))
		: chalk.bgRed(chalk.white(" ✖︎ "));

	log.log(`${icon} ${checkPassed ? name : chalk.red(checkResult.message)}`);
	if (!checkPassed && checkResult.fixCommand !== undefined) {
		log?.logIndent(
			`${chalk.yellow(`Possible fix command:`)} ${chalk.yellow(
				chalk.bold(checkResult.fixCommand),
			)}`,
			6,
		);
	}
}
