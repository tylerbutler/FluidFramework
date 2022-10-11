/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { extend as extendEnum } from 'extended-enum';

/**
 * A type that represents independent packages (as opposed to those that are part of a release group).
 *
 * @remarks
 *
 * This type is an alias for string now but it could become a real class/interface in the future. Right now it is the
 * full package name including scope.
 *
 * @internal
 */
export type ReleasePackage = string;

/**
 * An enum that represents known release groups.
 *
 * @internal
 */
/**
 * Represents the different types of release groups supported by the build tools. Each of these groups should be defined
 * in the fluid-build section of the root package.json.
 */
 enum _ReleaseGroup {
    Client = "client",
    Server = "server",
    Azure = "azure",
    BuildTools = "build-tools",
}

export class ReleaseGroup extends extendEnum<typeof _ReleaseGroup, _ReleaseGroup>(_ReleaseGroup) {}

/**
 * A type guard used to determine if a string is a ReleaseGroup.
 *
 * @internal
 */
export function isReleaseGroup(str: ReleaseGroup | string | undefined): str is ReleaseGroup {
    if(typeof str === "string") {
        return ReleaseGroup.from(str) !== undefined;
    }

    return str !== undefined;
}

/**
 * A type that represents where a release can originate. Most release groups use the releaseBranches value, and
 * individual packages use the direct value, which indicates releases originate from the main/lts branches. The
 * interactive value means the user should be asked to define the source dynamically.
 */
export type ReleaseSource = "direct" | "releaseBranches" | "interactive";
