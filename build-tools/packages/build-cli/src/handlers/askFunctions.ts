/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { bumpVersionScheme, detectBumpType } from "@fluid-tools/version-tools";
import { Machine } from "jssm";

import { generateReleaseBranchName, getDefaultBumpTypeForBranch, sortVersions } from "../lib";
import { CommandLogger } from "../logging.js";
import { MachineState } from "../machines/index.js";
import { FluidReleaseStateHandlerData } from "./fluidReleaseStateHandler.js";
import { StateHandlerFunction } from "./stateHandlers.js";

/**
 * Determines the release type based on context, or by asking the user if needed.
 *
 * @param state - The current state machine state.
 * @param machine - The state machine.
 * @param testMode - Set to true to run function in test mode.
 * @param log - A logger that the function can use for logging.
 * @param data - An object with handler-specific contextual data.
 * @returns True if the state was handled; false otherwise.
 */
export const askForReleaseType: StateHandlerFunction = async (
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
	const bumpedMajor = bumpVersionScheme(currentVersion, "major");
	const bumpedMinor = bumpVersionScheme(currentVersion, "minor");
	const bumpedPatch = bumpVersionScheme(currentVersion, "patch");

	const questions: inquirer.Question[] = [];

	log.log(`Starting release of ${releaseGroup} version ${releaseVersion}`);

	// If a bumpType was set in the handler data, use it. Otherwise set it as the default for the branch. If there's
	// no default for the branch, ask the user.
	let bumpType = inputBumpType ?? getDefaultBumpTypeForBranch(currentBranch);
	if (inputBumpType === undefined) {
		const choices = [
			{ value: "major", name: `major` },
			{
				value: "minor",
				name: `minor (will create ${releaseBranch} and bump ${currentBranch} to ${bumpedMinor})`,
			},
			{ value: "patch", name: `patch (should only be run from ${releaseBranch})` },
		];
		const askBumpType: inquirer.ListQuestion = {
			type: "list",
			name: "bumpType",
			choices,
			default: bumpType,
			message: `What type of release are you doing?`,
		};
		questions.push(askBumpType);

		const answers = await inquirer.prompt(questions);
		bumpType = answers.bumpType;
		data.bumpType = bumpType;
	}

	if (bumpType === undefined) {
		throw new Error(`bumpType is undefined.`);
	}

	// This state is unique; it uses major/minor/patch as the actions
	const result = machine.action(bumpType);
	if (result !== true) {
		throw new Error(`Failed when calling the ${bumpType} action from the ${state} state.`);
	}

	return true;
};

export const askForReleaseVersion: StateHandlerFunction = async (
	state: MachineState,
	machine: Machine<unknown>,
	testMode: boolean,
	log: CommandLogger,
	data: FluidReleaseStateHandlerData,
): Promise<boolean> => {
	if (testMode) return true;

	const { bumpType: inputBumpType, context, releaseVersion, releaseGroup } = data;

	const currentBranch = await context.gitRepo.getCurrentBranchName();
	const currentVersion = releaseVersion;
	const releaseBranch = generateReleaseBranchName(releaseGroup, releaseVersion);

	const recentVersions = await context.getAllVersions(releaseGroup, 10);
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

	const questions: inquirer.Question[] = [];

	// If a bumpType was set in the handler data, use it. Otherwise set it as the default for the branch. If there's
	// no default for the branch, ask the user.
	let bumpType = inputBumpType ?? getDefaultBumpTypeForBranch(currentBranch);
	if (inputBumpType === undefined) {
		const choices = [
			{ value: "major", name: majorVersionToRelease.version },
			{
				value: "minor",
				name: `${releaseVersion} (will create ${releaseBranch} and bump ${currentBranch} to ${minorVersionToRelease})`,
			},
			{
				value: "patch",
				name: `${patchVersionToRelease} (should only be run from ${prevPatchReleaseBranch})`,
			},
		];
		const askBumpType: inquirer.ListQuestion = {
			type: "list",
			name: "bumpType",
			choices,
			default: bumpType,
			message: `What version do you wish to release?`,
		};
		questions.push(askBumpType);

		const answers = await inquirer.prompt(questions);
		bumpType = answers.bumpType;
		data.bumpType = bumpType;
	}

	if (bumpType === undefined) {
		throw new Error(`bumpType is undefined.`);
	}

	// This state is unique; it uses major/minor/patch as the actions
	const result = machine.action(bumpType);
	if (result !== true) {
		throw new Error(`Failed when calling the ${bumpType} action from the ${state} state.`);
	}

	return true;
};
