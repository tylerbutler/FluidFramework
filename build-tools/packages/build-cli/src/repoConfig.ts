/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { IReleaseGroup } from "@fluid-tools/build-infrastructure";
import { minimatch } from "minimatch";

// Mapping of branch to a list of release groups/packages that should run policy by default.
// TODO: This should be configured in the fluid-build config, like type test defaults are.
const defaults = new Map([
	["main", "client"],
	["release/*", "client"],
]);

/**
 * Returns true if policy-check should run by default for a given branch/release group combination.
 */
export const getRunPolicyCheckDefault = (
	releaseGroupOrPackage: IReleaseGroup,
	branch: string,
): boolean => {
	if (branch === undefined) {
		return false;
	}

	for (const [branchPattern, shouldRunPolicy] of defaults) {
		if (minimatch(branch, branchPattern) === true) {
			return shouldRunPolicy.includes(releaseGroupOrPackage.name);
		}
	}

	return false;
};
