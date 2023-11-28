/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { Context, Workspace, Package, isMonoRepoKind } from "@fluidframework/build-tools";
import { Args } from "@oclif/core";

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
	context: Context,
): Package | Workspace | undefined => {
	if (isMonoRepoKind(name)) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return context.repo.workspaces.get(name)!;
	}

	return (
		context.fullPackageMap.get(name) ??
		context.repo.independentPackages.find((pkg) => pkg.nameUnscoped === name)
	);
};
