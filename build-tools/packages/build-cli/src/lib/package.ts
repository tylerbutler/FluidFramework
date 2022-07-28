/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

// eslint-disable-next-line unicorn/import-style
import { posix as path } from "path";
import { Context, readJsonAsync, Logger, Package, MonoRepo } from "@fluidframework/build-tools";
import ncu from "npm-check-updates";
import * as semver from "semver";
import { isReleaseGroup, ReleaseGroup, ReleasePackage } from "../releaseGroups";

/**
 * @param pkgName - The full scoped package name.
 * @returns The package name without the scope.
 */
export function getPackageShortName(pkgName: string) {
    let name = pkgName.split("/").pop()!;
    if (name.startsWith("fluid-")) {
        name = name.slice("fluid-".length);
    }

    return name;
}

/**
 * Checks the npm registry for updates for a release group's dependencies.
 *
 * @param context - The {@link Context}.
 * @param releaseGroup - The release group to check.
 * @param bumpType - The bump type.
 * @param prerelease - If true, include prerelease versions as eligible to update.
 * @param depsToUpdate - An array of packages on which dependencies should be checked.
 * @param log - A {@link Logger}.
 * @returns An array of packages that had updated dependencies.
 */
// eslint-disable-next-line max-params
export async function npmCheckUpdates(
    context: Context,
    releaseGroup: ReleaseGroup,
    depsToUpdate: ReleasePackage[] | RegExp[],
    bumpType: "patch" | "minor" | "current",
    prerelease = false,
    writeChanges = false,
    // eslint-disable-next-line unicorn/no-useless-undefined
    log: Logger | undefined = undefined,
): Promise<{
    updatedPackages: Package[];
    updatedDependencies: Package[];
}> {
    log?.info(`Checking npm for package updates...`);
    const monorepo = context.repo.releaseGroups.get(releaseGroup);
    if (monorepo === undefined) {
        throw new Error(`Can't find release group: ${releaseGroup}`);
    }

    const updatedPackages: Package[] = [];
    const deps = new Set<string>();
    // There can be a lot of duplicate log lines from npm-check-updates, so collect and dedupe before logging.
    const upgradeLogLines = new Set<string>();

    for (const workspaceGlob of monorepo.workspaceGlobs) {
        log?.verbose(`Checking packages in ${workspaceGlob}...`);
        // eslint-disable-next-line no-await-in-loop
        const result = (await ncu({
            filter: depsToUpdate,
            // filterVersion: new RegExp(".*?-\d+"),
            cwd: monorepo.repoPath,
            packageFile: `${workspaceGlob}/package.json`,
            target: bumpType === "current" ? "latest" : bumpType,
            pre: prerelease,
            upgrade: writeChanges,

            jsonUpgraded: true,
            // jsonAll: true,
            silent: true,
        })) as object;

        if (typeof result !== "object") {
            throw new TypeError(`Expected an object: ${typeof result}`);
        }

        for (const [pkgJsonPath, upgradedDeps] of Object.entries(result)) {
            const jsonPath = path.join(monorepo.repoPath, pkgJsonPath);
            // eslint-disable-next-line no-await-in-loop
            const { name } = await readJsonAsync(jsonPath);
            const pkg = context.fullPackageMap.get(name);
            if (pkg === undefined) {
                log?.warning(`Package not found in context: ${name}`);
                continue;
            }

            for (const [dep, newRange] of Object.entries(upgradedDeps)) {
                upgradeLogLines.add(`    ${dep}: '${newRange}'`);
                deps.add(dep);
            }

            if (Object.keys(upgradedDeps).length > 0) {
                updatedPackages.push(pkg);
            }
        }
    }

    log?.info(`${upgradeLogLines.size} released dependencies found on npm:`);
    for (const line of upgradeLogLines.values()) {
        log?.info(line);
    }

    const updatedDependencies: Package[] = getPackagesFromReleasePackages(context, [...deps]);

    return { updatedPackages, updatedDependencies };
}

export interface PreReleaseDependencies {
    releaseGroups: ReleaseGroup[];
    packages: ReleasePackage[];
    isEmpty: boolean;
}

/**
 * Checks all the packages in a release group for any that are a pre-release version.
 *
 * @param context - The context.
 * @param releaseGroup - The release group.
 * @returns Two arrays of release groups and packages that are prerelease and must be released before this release group
 * can be.
 */
export async function getPreReleaseDependencies(
    context: Context,
    releaseGroup: ReleaseGroup | ReleasePackage,
    // depsToUpdate: ReleasePackage[],
): Promise<PreReleaseDependencies> {
    const prereleasePackages = new Set<ReleasePackage>();
    const prereleaseGroups = new Set<ReleaseGroup>();
    let packagesToCheck: Package[];
    let depsToUpdate: ReleasePackage[];

    if (isReleaseGroup(releaseGroup)) {
        const monorepo = context.repo.releaseGroups.get(releaseGroup);
        if (monorepo === undefined) {
            throw new Error(`Can't find release group in context: ${releaseGroup}`);
        }

        packagesToCheck = monorepo.packages;
        depsToUpdate = context.packagesNotInReleaseGroup(releaseGroup).map((p) => p.name);
    } else {
        const pkg = context.fullPackageMap.get(releaseGroup);
        if (pkg === undefined) {
            throw new Error(`Can't find package in context: ${releaseGroup}`);
        }

        packagesToCheck = [pkg];
        depsToUpdate = context.packagesNotInReleaseGroup(pkg).map((p) => p.name);
    }

    for (const pkg of packagesToCheck) {
        for (const { name, version } of pkg.combinedDependencies) {
            // If it's not a dep we're looking to update, skip to the next dep
            if (!depsToUpdate.includes(name)) {
                continue;
            }

            // Convert the range into the minimum version
            const minVer = semver.minVersion(version);
            if (minVer === null) {
                throw new Error(`semver.minVersion was null: ${version} (${name})`);
            }

            // If the min version has a pre-release section, then it needs to be released.
            if (minVer.prerelease.length > 0) {
                const depPkg = context.fullPackageMap.get(name);
                if (depPkg === undefined) {
                    throw new Error(`Can't find package in context: ${name}`);
                }

                if (depPkg.monoRepo === undefined) {
                    prereleasePackages.add(depPkg.name);
                } else {
                    prereleaseGroups.add(depPkg.monoRepo.kind);
                }
            }
        }
    }

    const isEmpty = prereleaseGroups.size === 0 && prereleasePackages.size === 0;
    return {
        releaseGroups: [...prereleaseGroups],
        packages: [...prereleasePackages],
        isEmpty,
    };
}

function getPackagesFromReleasePackages(
    context: Context,
    relPackages: ReleasePackage[],
): Package[] {
    const packages: Package[] = [];

    for (const rp of relPackages) {
        const pkg = context.fullPackageMap.get(rp);
        if (pkg === undefined) {
            throw new Error(`Can't find package in context: ${rp}`);
        }

        packages.push(pkg);
    }

    return packages;
}

/**
 * Returns true if a release group or package in the repo has been released.
 *
 * @param context - The context.
 * @param releaseGroup - The release group to check.
 * @returns True if the release group was released.
 */
export async function isReleased(
    context: Context,
    releaseGroup: MonoRepo | Package | string,
): Promise<boolean> {
    await context.gitRepo.fetchTags();

    let tagName = "";
    if (typeof releaseGroup === "string" && isReleaseGroup(releaseGroup)) {
        // eslint-disable-next-line no-param-reassign
        releaseGroup = context.repo.releaseGroups.get(releaseGroup)!;
    }

    if (releaseGroup instanceof MonoRepo) {
        const kindLowerCase = releaseGroup.kind.toLowerCase();
        tagName = `${kindLowerCase}_v${releaseGroup.version}`;
    } else if (typeof releaseGroup !== "string") {
        tagName = `${getPackageShortName(releaseGroup.name)}_v${releaseGroup.version}`;
    }

    const rawTag = await context.gitRepo.getTags(tagName);
    return rawTag.trim() === tagName;
}
