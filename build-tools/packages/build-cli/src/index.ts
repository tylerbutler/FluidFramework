/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
// import { Flags as OclifFlags } from "@oclif/core";

export { run } from "@oclif/core";

export type { Context } from "@fluidframework/build-tools";
export type { knownReleaseGroups, ReleaseGroup, ReleasePackage } from "./releaseGroups";

export { BaseCommand, type Args, type Flags as CommandFlags } from "./base";
export { PackageCommand } from "./BasePackageCommand";
export {
	PackageFilterOptions,
	PackageSelectionCriteria,
	PackageKind,
	PackageWithKind,
} from "./filter";
export { CommandLogger } from "./logging";

// import {
// 	releaseGroupFlag,
// 	releaseGroupWithAllFlag,
// 	packageSelectorFlag,
// 	semverRangeFlag,
// 	bumpTypeExtendedFlag,
// 	bumpTypeFlag,
// } from "./flags";

export { checkFlags, skipCheckFlag } from "./flags";

// export const Flags = {
// 	boolean: OclifFlags.boolean,
// 	directory: OclifFlags.directory,
// 	file: OclifFlags.file,
// 	integer: OclifFlags.integer,
// 	string: OclifFlags.string,
// 	url: OclifFlags.url,
// 	custom: OclifFlags.custom,
// 	releaseGroup: releaseGroupFlag,
// 	releaseGroupWithAll: releaseGroupWithAllFlag,
// 	packageSelector: packageSelectorFlag,
// 	semverRange: semverRangeFlag,
// 	bumpTypeExtended: bumpTypeExtendedFlag,
// 	bumpType: bumpTypeFlag,
// };
