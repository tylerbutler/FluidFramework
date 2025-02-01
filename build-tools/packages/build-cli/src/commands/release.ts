/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "node:assert";
import {
	VersionBumpType,
	bumpVersionScheme,
	detectVersionScheme,
	fromInternalScheme,
	fromVirtualPatchScheme,
} from "@fluid-tools/version-tools";
import { Separator, rawlist } from "@inquirer/prompts";
import { Config } from "@oclif/core";
import { formatDistanceToNow } from "date-fns";
import chalk from "picocolors";
import semver from "semver";

import { findPackageOrReleaseGroup } from "../args.js";
import {
	bumpTypeFlag,
	checkFlags,
	packageSelectorFlag,
	releaseGroupFlag,
	skipCheckFlag,
} from "../flags.js";
import {
	FluidReleaseStateHandler,
	FluidReleaseStateHandlerData,
	StateHandler,
} from "../handlers/index.js";
import { PromptWriter } from "../instructionalPromptWriter.js";
import { type VersionDetails, sortVersions } from "../library/index.js";
import type { CommandLogger } from "../logging.js";
import { FluidReleaseMachine } from "../machines/index.js";
import { getRunPolicyCheckDefault } from "../repoConfig.js";
import { StateMachineCommand } from "../stateMachineCommand.js";

/**
 * Releases a package or release group. This command is mostly scaffolding and setting up the state machine, handlers,
 * and the data to pass to the handlers. Most of the logic for handling the release is contained in the
 * {@link FluidReleaseStateHandler} itself.
 */

export default class ReleaseCommand extends StateMachineCommand<typeof ReleaseCommand> {
	static readonly summary = "Releases a package or release group.";
	static readonly description =
		`The release command ensures that a release branch is in good condition, then walks the user through releasing a package or release group.

    The command runs a number of checks automatically to make sure the branch is in a good state for a release. If any of the dependencies are also in the repo, then they're checked for the latest release version. If the dependencies have not yet been released, then the command prompts to perform the release of the dependency, then run the release command again.

    This process is continued until all the dependencies have been released, after which the release group itself is released.`;

	readonly machine = FluidReleaseMachine;
	handler: StateHandler | undefined;
	data: FluidReleaseStateHandlerData | undefined;

	constructor(argv: string[], config: Config) {
		super(argv, config);
		this.data = undefined;
	}

	static readonly flags = {
		releaseGroup: releaseGroupFlag({
			exclusive: ["package"],
			required: false,
		}),
		package: packageSelectorFlag({
			exclusive: ["releaseGroup"],
			required: false,
		}),
		bumpType: bumpTypeFlag({
			required: false,
		}),
		skipChecks: skipCheckFlag,
		...checkFlags,
		...StateMachineCommand.flags,
	} as const;

	async init(): Promise<void> {
		await super.init();
		const context = await this.getContext();

		const { argv, flags, logger, machine } = this;

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const rgOrPackageName = flags.releaseGroup ?? flags.package!;
		assert(
			rgOrPackageName !== undefined,
			"Either release group and package flags must be provided.",
		);

		const packageOrReleaseGroup = findPackageOrReleaseGroup(rgOrPackageName, context);
		if (packageOrReleaseGroup === undefined) {
			this.error(`Could not find release group or package: ${rgOrPackageName}`, {
				exit: 1,
			});
		}
		const releaseGroup = packageOrReleaseGroup.name;
		const releaseVersion = packageOrReleaseGroup.version;
		const gitRepo = await context.getGitRepository();
		const currentBranch = await gitRepo.getCurrentBranchName();
		const [bumpType] = await askForReleaseVersion(this.logger, {
			bumpType: flags.bumpType,
			context,
			releaseGroup,
			releaseVersion,
		});

		// eslint-disable-next-line no-warning-comments
		// TODO: can be removed once server team owns server releases
		if (flags.releaseGroup === "server" && flags.bumpType === "minor") {
			this.error(`Server release are always a ${chalk.bold("MAJOR")} release`);
		}

		// oclif doesn't support nullable boolean flags, so this works around that limitation by checking the args
		// passed into the command. If neither are passed, then the default is determined by the branch config.
		const userPolicyCheckChoice = argv.includes("--policyCheck")
			? true
			: argv.includes("--no-policyCheck")
				? false
				: undefined;

		const branchPolicyCheckDefault = getRunPolicyCheckDefault(
			releaseGroup,
			gitRepo.originalBranchName,
		);

		this.handler = new FluidReleaseStateHandler(machine, logger);

		this.data = {
			releaseGroup,
			releaseVersion,
			context,
			promptWriter: new PromptWriter(logger),
			bumpType,
			versionScheme: detectVersionScheme(releaseVersion),
			shouldSkipChecks: flags.skipChecks,
			shouldCheckPolicy:
				userPolicyCheckChoice ?? (branchPolicyCheckDefault && !flags.skipChecks),
			shouldCheckBranch: flags.branchCheck && !flags.skipChecks,
			shouldCheckMainNextIntegrated: !flags.skipChecks,
			shouldCommit: flags.commit && !flags.skipChecks,
			shouldInstall: flags.install && !flags.skipChecks,
			shouldCheckBranchUpdate: flags.updateCheck && !flags.skipChecks,
			exitFunc: (code: number): void => this.exit(code),
			command: this,
		};

		// this.data.bumpType = await askForReleaseVersion(this.logger, this.data);
	}
}

/**
 * Ask the user which version they are releasing, and return the bump type based on the version specified.
 */
const askForReleaseVersion = async (
	log: CommandLogger,
	data: Partial<Pick<FluidReleaseStateHandlerData, "bumpType">> &
		Pick<FluidReleaseStateHandlerData, "context" | "releaseVersion" | "releaseGroup">,
): Promise<[VersionBumpType, string]> => {
	const {
		bumpType: inputBumpType,
		context,
		releaseVersion: branchVersion,
		releaseGroup,
	} = data;

	const gitRepo = await context.getGitRepository();
	const currentBranch = await gitRepo.getCurrentBranchName();

	const recentVersions = await gitRepo.getAllVersions(releaseGroup);
	assert(recentVersions !== undefined, "versions is undefined");

	const mostRecentRelease = recentVersions?.[0];

	// Split the versions by version scheme because we need to treat them differently
	const regularSemVer: VersionDetails[] = [];
	const internalVersions: VersionDetails[] = [];
	const virtualPatchVersions: VersionDetails[] = [];
	for (const verDetails of recentVersions) {
		const scheme = detectVersionScheme(verDetails.version);
		if (scheme === "internal" || scheme === "internalPrerelease") {
			internalVersions.push(verDetails);
		} else if (scheme === "virtualPatch") {
			virtualPatchVersions.push(verDetails);
		} else {
			regularSemVer.push(verDetails);
		}
	}

	// take the highest releases from each minor series as the input for choices
	const choices = [
		...choicesFromVersions(takeHighestOfMinorSeries(internalVersions)),
		...choicesFromVersions(takeHighestOfMinorSeries(virtualPatchVersions)),
		...choicesFromVersions(takeHighestOfMinorSeries(regularSemVer)),
	];

	log.log(`Branch: ${chalk.blue(currentBranch)}`);
	log.log(`${chalk.blue(releaseGroup)} version on this branch: ${chalk.bold(branchVersion)}`);
	log.log(
		`Most recent release: ${mostRecentRelease.version} (${
			mostRecentRelease.date === undefined
				? `no date`
				: formatDistanceToNow(mostRecentRelease.date)
		})`,
	);
	log.log("");

	// If a bumpType was set in the handler data, use it. Otherwise set it as the default for the branch. If there's
	// no default for the branch, ask the user.
	let bumpType = inputBumpType;
	let releaseVersion: string = "";
	if (bumpType === undefined) {
		const versionToRelease = await rawlist({
			choices,
			message: `What version do you wish to release?`,
		});

		bumpType = versionToRelease.bumpType;
		releaseVersion = versionToRelease.version;
	}

	if (bumpType === undefined || releaseVersion === "") {
		throw new Error(`bumpType is undefined.`);
	}

	return [bumpType, releaseVersion];
};

/**
 * Iterates through the versions and takes the first (highest) version of every minor version series. That is, the input
 * [2.2.3, 2.2.2, 1.2.3, 1.2.2] will return [2.2.3, 1.2.3].
 *
 * All versions in the input must be of the same scheme or this function will throw.
 */
function takeHighestOfMinorSeries(versions: VersionDetails[]): VersionDetails[] {
	const minorSeries = new Set<string>();
	const minors: VersionDetails[] = [];

	if (versions.length === 0) {
		return minors;
	}

	// Detect version scheme based on first element
	const expectedScheme = detectVersionScheme(versions[0].version);
	const sortedVersions = sortVersions(versions, "version");
	for (const details of sortedVersions) {
		const { version } = details;
		const detectedScheme = detectVersionScheme(version);
		if (expectedScheme !== detectedScheme) {
			throw new Error(
				`All versions should use the ${expectedScheme} version scheme, but found one using ${detectedScheme} (${version}).`,
			);
		}

		const scheme = detectVersionScheme(version);
		const versionNormalized =
			scheme === "internal" || scheme === "internalPrerelease"
				? // Second item in the returned 3-tuple is the internal version
					fromInternalScheme(version)[1]
				: scheme === "virtualPatch"
					? fromVirtualPatchScheme(version).version
					: version;

		const minorZero = `${semver.major(versionNormalized)}.${semver.minor(versionNormalized)}.0`;
		if (!minorSeries.has(minorZero)) {
			minors.push(details);
			minorSeries.add(minorZero);
		}
	}

	return minors;
}

function choicesFromVersions(
	versions: VersionDetails[],
): (Separator | { value: { bumpType: VersionBumpType; version: string }; name: string })[] {
	const choices: (
		| Separator
		| { value: { bumpType: VersionBumpType; version: string }; name: string }
	)[] = [];
	for (const [index, relVersion] of versions.entries()) {
		// The first item is the most recent release, so offer all three bumped versions as release options
		if (index === 0) {
			const majorVer = bumpVersionScheme(relVersion.version, "major").version;
			choices.push({
				value: { bumpType: "major", version: majorVer },
				name: `${majorVer} (major)`,
			});

			const minorVer = bumpVersionScheme(relVersion.version, "minor").version;
			choices.push({
				value: { bumpType: "minor", version: minorVer },
				name: `${minorVer} (minor)`,
			});

			const patchVer = bumpVersionScheme(relVersion.version, "patch").version;
			choices.push({
				value: { bumpType: "patch", version: patchVer },
				name: `${patchVer} (patch)`,
			});
		} else {
			const patchVer = bumpVersionScheme(relVersion.version, "patch").version;
			choices.push({
				value: { bumpType: "patch", version: patchVer },
				name: `${patchVer} (patch)`,
			});
		}

		choices.push(new Separator());
	}

	return choices;
}
