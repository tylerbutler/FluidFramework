/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { ReleaseGroup, ReleasePackage } from "./releaseGroups";

export interface CheckSkipper {
    shouldSkipChecks: boolean;
}

// export interface Checker {

// }

export interface ChecksValidReleaseGroup {
    readonly releaseGroup: ReleaseGroup | ReleasePackage | undefined;
    releaseVersion: string | undefined;
}

export interface ChecksPolicy extends CheckSkipper {
    shouldCheckPolicy: boolean;
}

export interface ChecksBranchName extends CheckSkipper {
    checkBranchName(branch: string): boolean;
    readonly checkBranchNameErrorMessage: string;
    shouldCheckBranch: boolean;
}

export interface ChecksBranchUpdate extends CheckSkipper {
    shouldCheckBranchUpdate: boolean;
}

export interface ChecksShouldCommit extends CheckSkipper {
    shouldCommit: boolean;
}

// export interface ChecksReleaseBranch {
//     releaseBranchName: string;
// }
