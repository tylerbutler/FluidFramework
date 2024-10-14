/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import * as semver from "semver";

import { updatePackageJsonFile } from "./packageJsonUtils.js";
import type { IFluidRepo, IPackage, PackageJson } from "./types.js";

/**
 * Sets the version of a group of packages.
 *
 * @param fluidRepo - The {@link IFluidRepo}.
 * @param items - An array of objects whose version should be updated.
 * @param version - The version to set.
 */
export async function setVersion<J extends PackageJson>(
	fluidRepo: IFluidRepo,
	items: IPackage[],
	version: semver.SemVer,
): Promise<void> {
	const translatedVersion = version;
	for (const pkg of items) {
		updatePackageJsonFile<J>(pkg.directory, (json) => {
			json.version = translatedVersion.version;
		});
	}
	fluidRepo.reload();
}
