/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { FluidRepoContext, Workspace, Package } from "@fluidframework/build-tools";
import { Args } from "@oclif/core";
import { isReleaseGroup } from "./releaseGroups";

/**
 * A re-usable CLI argument for package or release group names.
 */
export const packageOrReleaseGroupArg = Args.string({
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
	context: FluidRepoContext,
): Package | Workspace | undefined => {
	if (isReleaseGroup(name)) {
		return context.repo.releaseGroups.get(name);
	}

	return (
		context.repo.fullPackageMap().get(name) ??
		context.repo.independentPackages.find((pkg) => pkg.nameUnscoped === name)
	);
};
