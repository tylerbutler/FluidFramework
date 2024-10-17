/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import * as semver from "semver";

import { updatePackageJsonFile } from "./packageJsonUtils.js";
import type { IFluidRepo, IPackage, PackageJson } from "./types.js";

/**
 * Sets the version of a release group or standalone package.
 *
 * @param fluidRepo - The {@link IFluidRepo}.
 * @param items - An array of objects whose version should be updated.
 * @param version - The version to set.
 * @param log - A logger to use.
 */
export async function setVersion<P extends IPackage=IPackage>(
	fluidRepo: IFluidRepo<P>,
	items: { directory: string }[],
	version: semver.SemVer,
): Promise<void> {
	const translatedVersion = version;
	for (const pkg of items) {
		updatePackageJsonFile(pkg.directory, (json: PackageJson) => {
			json.version = translatedVersion.version;
		});
	}
	fluidRepo.reload();
}
