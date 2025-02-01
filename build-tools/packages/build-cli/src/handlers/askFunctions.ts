/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "node:assert";
import {
	type VersionBumpType,
	bumpVersionScheme,
	detectBumpType,
} from "@fluid-tools/version-tools";
import { rawlist } from "@inquirer/prompts";
import { Machine } from "jssm";

import {
	generateReleaseBranchName,
	getDefaultBumpTypeForBranch,
	sortVersions,
} from "../library/index.js";
import { CommandLogger } from "../logging.js";
import { MachineState } from "../machines/index.js";
import { FluidReleaseStateHandlerData } from "./fluidReleaseStateHandler.js";
import { StateHandlerFunction } from "./stateHandlers.js";

export const askForReleaseVersion: StateHandlerFunction = async (
	state: MachineState,
	machine: Machine<unknown>,
	testMode: boolean,
	log: CommandLogger,
	data: FluidReleaseStateHandlerData,
): Promise<boolean> => {
	if (testMode) return true;

	const { bumpType: inputBumpType, context, releaseVersion, releaseGroup } = data;

	const gitRepo = await context.getGitRepository();
	const currentBranch = await gitRepo.getCurrentBranchName();
	const currentVersion = releaseVersion;
	const releaseBranch = generateReleaseBranchName(releaseGroup, releaseVersion);

	const recentVersions = await gitRepo.getAllVersions(releaseGroup);
	assert(recentVersions !== undefined, "versions is undefined");

	const sortedVersions = sortVersions([...recentVersions], "version");

	// Find the most recent patch release
	const prevVer = sortedVersions.find(
		(v) =>
			detectBumpType(v.version, releaseVersion) === "minor" && v.version !== releaseVersion,
	);
	assert(prevVer !== undefined, "prevVer is undefined");

	const prevPatchReleaseBranch = generateReleaseBranchName(releaseGroup, prevVer.version);
	const majorVersionToRelease = bumpVersionScheme(currentVersion, "major");
	const minorVersionToRelease = bumpVersionScheme(currentVersion, "minor");
	const patchVersionToRelease = bumpVersionScheme(prevVer.version, "patch");

	// If a bumpType was set in the handler data, use it. Otherwise set it as the default for the branch. If there's
	// no default for the branch, ask the user.
	let bumpType = inputBumpType ?? getDefaultBumpTypeForBranch(currentBranch);
	if (inputBumpType === undefined) {
		const releaseSource = await rawlist({
			message: `What version do you wish to release?`,
			choices: [
				{ value: "major" as VersionBumpType, name: majorVersionToRelease.version },
				{
					value: "minor" as VersionBumpType,
					name: `${releaseVersion} (will create ${releaseBranch} and bump ${currentBranch} to ${minorVersionToRelease})`,
				},
				{
					value: "patch" as VersionBumpType,
					name: `${patchVersionToRelease} (should only be run from ${prevPatchReleaseBranch})`,
				},
			],
		});

		// const answers = await inquirer.prompt(questions);
		bumpType = releaseSource;
	}

	if (bumpType === undefined) {
		throw new Error(`bumpType is undefined.`);
	}

	// TODO: Fix this.
	// eslint-disable-next-line require-atomic-updates
	data.bumpType = bumpType;

	// This state is unique; it uses major/minor/patch as the actions
	const result = machine.action(bumpType);
	if (result !== true) {
		throw new Error(`Failed when calling the ${bumpType} action from the ${state} state.`);
	}

	return true;
};
