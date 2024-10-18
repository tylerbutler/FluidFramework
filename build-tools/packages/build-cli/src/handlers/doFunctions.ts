/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "node:assert";

import {
	type IReleaseGroup,
	type PackageName,
	setVersion,
} from "@fluid-tools/build-infrastructure";
import { bumpVersionScheme, detectVersionScheme } from "@fluid-tools/version-tools";
import chalk from "chalk";
import { Machine } from "jssm";

import { getPreReleaseDependencies } from "../library/index.js";
// eslint-disable-next-line import/no-internal-modules
import { npmCheckUpdatesHomegrown } from "../library/package.js";
import { CommandLogger } from "../logging.js";
import { MachineState } from "../machines/index.js";
import { FluidReleaseStateHandlerData } from "./fluidReleaseStateHandler.js";
import { BaseStateHandler, StateHandlerFunction } from "./stateHandlers.js";

/**
 * Bumps any pre-release dependencies that have been released.
 *
 * @param state - The current state machine state.
 * @param machine - The state machine.
 * @param testMode - Set to true to run function in test mode.
 * @param log - A logger that the function can use for logging.
 * @param data - An object with handler-specific contextual data.
 * @returns True if the state was handled; false otherwise.
 */
export const doBumpReleasedDependencies: StateHandlerFunction = async (
	state: MachineState,
	machine: Machine<unknown>,
	testMode: boolean,
	log: CommandLogger,
	data: FluidReleaseStateHandlerData,
): Promise<boolean> => {
	if (testMode) return true;

	const { repo, releaseGroup } = data;

	const { releaseGroups, isEmpty } = await getPreReleaseDependencies(repo, releaseGroup);

	assert(!isEmpty, `No prereleases found in DoBumpReleasedDependencies state.`);

	const packagesToBump = new Set<PackageName>();
	for (const group of releaseGroups.keys()) {
		for (const pkg of group.packages) {
			packagesToBump.add(pkg.name);
		}
	}

	// First, check if any prereleases have released versions on npm
	let { updatedPackages, updatedDependencies } = await npmCheckUpdatesHomegrown(
		repo,
		releaseGroup.name,
		[...packagesToBump],
		undefined,
		// "latest",
		/* prerelease */ true,
		/* writeChanges */ false,
		log,
	);

	const updatedReleaseGroups = new Set<IReleaseGroup>();

	for (const p of Object.keys(updatedDependencies)) {
		const pkg = repo.packages.get(p as PackageName);
		if (pkg === undefined) {
			log.verbose(`Package not in context: ${p}`);
			continue;
		}

		updatedReleaseGroups.add(repo.getPackageReleaseGroup(pkg));
	}

	if (updatedReleaseGroups.size === 0) {
		// This is the same command as run above, but this time we write the changes. There are more
		// efficient ways to do this but this is simple.
		({ updatedPackages, updatedDependencies } = await npmCheckUpdatesHomegrown(
			repo,
			releaseGroup.name,
			[...packagesToBump],
			undefined,
			// "latest",
			/* prerelease */ true,
			/* writeChanges */ false,
			/* no logger */
		));
	}

	if (updatedPackages.length > 0) {
		log?.verbose(`Running install if needed.`);
		await updatedPackages[0].workspace.install(true);
		// There were updates, which is considered a failure.
		BaseStateHandler.signalFailure(machine, state);
		repo.reload();
		return true;
	}

	BaseStateHandler.signalSuccess(machine, state);
	return true;
};

/**
 * Bumps any pre-release dependencies that have been released.
 *
 * @param state - The current state machine state.
 * @param machine - The state machine.
 * @param testMode - Set to true to run function in test mode.
 * @param log - A logger that the function can use for logging.
 * @param data - An object with handler-specific contextual data.
 * @returns True if the state was handled; false otherwise.
 */
export const doReleaseGroupBump: StateHandlerFunction = async (
	state: MachineState,
	machine: Machine<unknown>,
	testMode: boolean,
	log: CommandLogger,
	data: FluidReleaseStateHandlerData,
): Promise<boolean> => {
	if (testMode) return true;

	const { bumpType, repo, releaseGroup, releaseVersion, shouldInstall } = data;

	const scheme = detectVersionScheme(releaseVersion);
	const newVersion = bumpVersionScheme(releaseVersion, bumpType, scheme);
	const { packages } = releaseGroup;

	log.info(
		`Bumping ${releaseGroup} from ${releaseVersion} to ${newVersion.version} (${chalk.blue(
			bumpType,
		)} bump)!`,
	);

	await setVersion(packages, newVersion);

	if (shouldInstall === true && !(await releaseGroup.workspace.install(false))) {
		log.errorLog("Install failed.");
		BaseStateHandler.signalFailure(machine, state);
		return true;
	}

	BaseStateHandler.signalSuccess(machine, state);
	return true;
};
