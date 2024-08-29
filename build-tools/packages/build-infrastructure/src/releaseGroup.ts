/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { matchesReleaseGroupDefinition, type ReleaseGroupDefinition } from "./config.js";
import type { IPackage, IReleaseGroup, ReleaseGroupName } from "./interfaces.js";

export class ReleaseGroup implements IReleaseGroup {
	public readonly name: ReleaseGroupName;
	public constructor(
		name: string,
		releaseGroupDefinition: ReleaseGroupDefinition,
		packagesInWorkspace: IPackage[],
	) {
		this.name = name as ReleaseGroupName;
		this.packages = packagesInWorkspace.filter((pkg) =>
			matchesReleaseGroupDefinition(pkg, releaseGroupDefinition),
		);
	}

	public readonly packages: IPackage[];
}
