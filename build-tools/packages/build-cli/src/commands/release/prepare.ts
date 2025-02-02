/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { findPackageOrReleaseGroup, packageOrReleaseGroupArg } from "../../args.js";
import { BaseCommand } from "../../library/commands/base.js";
import { reportResult, runChecks } from "../../library/commands/release/prepare.js";
import {
	CheckDependenciesInstalled,
	type CheckFunction,
	CheckHasNoPrereleaseDependencies,
	CheckHasRemoteBranchUpToDate,
	CheckNoLocalChanges,
	CheckNoPolicyViolations,
	CheckNoUntaggedAsserts,
	CheckReleaseNotes,
	type CheckResult,
	// library is overloaded with too much stuff now, and we should consider allowing interior imports.
	// eslint-disable-next-line import/no-internal-modules
} from "../../library/releasePrepChecks.js";

/**
 * All the checks that should be executed. The checks are executed serially in this order.
 */
const allChecks: ReadonlyMap<string, CheckFunction> = new Map([
	["Branch has no local changes", CheckNoLocalChanges],
	[
		"The local branch is up to date with the microsoft/FluidFramework remote",
		CheckHasRemoteBranchUpToDate,
	],
	["Dependencies are installed locally", CheckDependenciesInstalled],
	["Has no pre-release Fluid dependencies", CheckHasNoPrereleaseDependencies],
	["No repo policy violations", CheckNoPolicyViolations],
	["No untagged asserts", CheckNoUntaggedAsserts],
	["Release notes have been generated", CheckReleaseNotes],
]);

/**
 * Runs checks on a local branch to verify it is ready to serve as the base for a release branch.
 */
export class ReleasePrepareCommand extends BaseCommand<typeof ReleasePrepareCommand> {
	public static readonly summary =
		`Runs checks on a local branch to verify it is ready to serve as the base for a release branch.`;

	public static readonly aliases: string[] = ["release:prep"];

	public static readonly description = `Runs the following checks:\n${[
		"",
		...allChecks.keys(),
	].join("\n- ")}`;

	public static readonly args = {
		package_or_release_group: packageOrReleaseGroupArg({
			description:
				"The name of a package or a release group. Defaults to the client release group if not specified.",
			default: "client",
		}),
	} as const;

	public async run(): Promise<Map<string, CheckResult>> {
		const context = await this.getContext();

		const rgArg = this.args.package_or_release_group;
		const pkgOrReleaseGroup = findPackageOrReleaseGroup(rgArg, context);
		if (pkgOrReleaseGroup === undefined) {
			this.error(`Can't find package or release group "${rgArg}"`, { exit: 1 });
		}
		this.verbose(`Release group or package found: ${pkgOrReleaseGroup.name}`);

		this.logHr();

		const generator = runChecks(context, pkgOrReleaseGroup, allChecks, {
			// TODO: Is there a better strategy here? May e it should be an optional
			releaseType: "minor",
			releaseVersion: pkgOrReleaseGroup.version,
		});

		const checkResults: Map<string, CheckResult> = new Map();
		for await (const [name, result] of generator) {
			checkResults.set(name, result);
			reportResult(name, result, this.logger);
			if (result?.fatal === true) {
				this.error("Can't run other checks until the failures are resolved.", { exit: 5 });
			}
		}

		return checkResults;
	}
}
