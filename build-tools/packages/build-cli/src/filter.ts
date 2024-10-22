/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	AllPackagesSelectionCriteria,
	EmptySelectionCriteria,
	type PackageFilterOptions,
	PackageSelectionCriteria,
} from "@fluid-tools/build-infrastructure";

import { type PackageSelectionDefault, filterFlags, selectionFlags } from "./flags.js";

/**
 * Parses {@link selectionFlags} into a typed object that is more ergonomic than working with the flag values directly.
 *
 * @param flags - The parsed command flags.
 * @param defaultSelection - Controls what packages are selected when all flags are set to their default values. With
 * the default value of undefined, no packages will be selected. Setting this to `all` will select all packages by
 * default. Setting it to `dir` will select the package in the current directory.
 */
export const parsePackageSelectionFlags = (
	flags: selectionFlags,
	defaultSelection: PackageSelectionDefault,
): PackageSelectionCriteria => {
	const useDefault =
		flags.releaseGroup === undefined &&
		flags.releaseGroupRoot === undefined &&
		flags.dir === undefined &&
		(flags.packages === false || flags.packages === undefined) &&
		(flags.all === false || flags.all === undefined);

	if (flags.all || (useDefault && defaultSelection === "all")) {
		return AllPackagesSelectionCriteria;
	}

	if (useDefault && defaultSelection === "dir") {
		return {
			...EmptySelectionCriteria,
			directory: ".",
		};
	}

	const releaseGroups =
		flags.releaseGroup?.includes("all") === true
			? AllPackagesSelectionCriteria.releaseGroups
			: flags.releaseGroup;

	const roots =
		flags.releaseGroupRoot?.includes("all") === true
			? AllPackagesSelectionCriteria.releaseGroupRoots
			: flags.releaseGroupRoot;

	return {
		...EmptySelectionCriteria,
		releaseGroups: releaseGroups ?? [],
		releaseGroupRoots: roots ?? [],
		directory: flags.dir,
	};
};

/**
 * Parses {@link filterFlags} into a typed object that is more ergonomic than working with the flag values directly.
 *
 * @param flags - The parsed command flags.
 */
export const parsePackageFilterFlags = (flags: filterFlags): PackageFilterOptions => {
	const options: PackageFilterOptions = {
		private: flags.private,
		scope: flags.scope,
		skipScope: flags.skipScope,
	};

	return options;
};
