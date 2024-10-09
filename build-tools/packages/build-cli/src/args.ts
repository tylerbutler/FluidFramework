/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	type IFluidRepo,
	type IPackage,
	type IReleaseGroup,
	type PackageName,
	type ReleaseGroupName,
} from "@fluid-tools/build-infrastructure";
import { Args } from "@oclif/core";
import { PackageName as PackageScope } from "@rushstack/node-core-library";
import * as semver from "semver";

/**
 * Creates a CLI argument for package or release group names. It's a factory function so that commands can override the
 * properties more easily when using the argument.
 */
export const packageOrReleaseGroupArg = Args.custom({
	name: "package_or_release_group",
	required: true,
	description: "The name of a package or a release group.",
});

/**
 * Takes a packageOrReleaseGroupArg and searches the context for it. Release groups are checked first, then independent
 * packages by scoped name, then by unscoped name.
 */
export const findPackageOrReleaseGroup = (
	name: string,
	repo: IFluidRepo,
): IPackage | IReleaseGroup | undefined => {
	const releaseGroup = repo.releaseGroups.get(name as ReleaseGroupName);
	if (releaseGroup !== undefined) {
		return releaseGroup;
	}

	const foundPackage =
		repo.packages.get(name as PackageName) ??
		[...repo.packages.values()].find((pkg) => PackageScope.getUnscopedName(pkg.name) === name);

	return foundPackage;
};

/**
 * Creates a CLI argument for semver versions. It's a factory function so that commands can override the properties more
 * easily when using the argument.
 */
export const semverArg = Args.custom<semver.SemVer, { loose?: boolean }>({
	required: true,
	description:
		"A semantic versioning (semver) version string. Values are verified to be valid semvers during argument parsing.",
	parse: async (input, _, opts) => {
		const parsed = semver.parse(input, opts.loose);
		if (parsed === null) {
			throw new Error(`Invalid semver: ${input}`);
		}
		return parsed;
	},
});
