/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import path from "node:path";
import mm from "micromatch";

import { getChangedSinceRef, getRemote } from "./git.js";
import { type IFluidRepo, IPackage } from "./types.js";

export const defaultSelectionKinds = ["dir", "all"] as const;

/**
 * A convenience type representing a glob string.
 */
export type GlobString = string;

/**
 * The criteria that should be used for selecting package-like objects from a collection.
 */
export interface PackageSelectionCriteria {
	/**
	 * An array of workspaces whose packages are selected. All packages in the workspace _except_ the root package
	 * will be selected. To include workspace roots, use the `workspaceRoots` property.
	 *
	 * Values should either be complete workspace names or micromatch glob strings. To select all workspaces, use `"*"`.
	 * See <https://www.npmjs.com/package/micromatch?activeTab=readme#extended-globbing> for more details.
	 *
	 * Workspace names will be compared against all globs - if any match, the workspace will be selected.
	 */
	workspaces: (GlobString | string)[];

	/**
	 * An array of workspaces whose root packages are selected. Only the roots of each workspace will be included.
	 *
	 * Values should either be complete workspace names or micromatch glob strings. To select all workspaces, use `"*"`.
	 * See <https://www.npmjs.com/package/micromatch?activeTab=readme#extended-globbing> for more details.
	 *
	 * Workspace names will be compared against all globs - if any match, the workspace will be selected.
	 */
	workspaceRoots: (GlobString | string)[];

	/**
	 * An array of release groups whose packages are selected. All packages in the release group _except_ the root package
	 * will be selected. To include release group roots, use the `releaseGroupRoots` property.
	 *
	 * Values should either be complete release group names or micromatch glob strings. To select all release groups, use
	 * `"*"`. See <https://www.npmjs.com/package/micromatch?activeTab=readme#extended-globbing> for more details.
	 *
	 * Workspace names will be compared against all globs - if any match, the workspace will be selected.
	 */
	releaseGroups: (GlobString | string)[];

	/**
	 * An array of release groups whose root packages are selected. Only the roots of each release group will be included.
	 * Rootless release groups will never be selected with this criteria.
	 *
	 * The reserved string "\*" will select all packages when included in one of the criteria. If used, the "\*" value is
	 * expected to be the only item in the selection array.
	 */
	releaseGroupRoots: (GlobString | string)[];

	/**
	 * If set, only selects the single package in this directory.
	 */
	directory?: string | undefined;

	/**
	 * If set, only selects packages that have changes when compared with the branch of this name.
	 */
	changedSinceBranch?: string | undefined;
}

/**
 * A pre-defined PackageSelectionCriteria that selects all packages.
 */
export const AllPackagesSelectionCriteria: PackageSelectionCriteria = {
	workspaces: ["*"],
	workspaceRoots: ["*"],
	releaseGroups: [],
	releaseGroupRoots: [],
	directory: undefined,
	changedSinceBranch: undefined,
};

/**
 * The criteria that should be used for filtering package-like objects from a collection.
 */
export interface PackageFilterOptions {
	/**
	 * If set, filters IN packages whose scope matches the strings provided.
	 */
	scope?: string[] | undefined;
	/**
	 * If set, filters OUT packages whose scope matches the strings provided.
	 */
	skipScope?: string[] | undefined;

	/**
	 * If set, filters private packages in/out.
	 */
	private: boolean | undefined;
}

/**
 * Selects packages from a FluidRepo based on the selection criteria.
 *
 * @param fluidRepo - The Fluid repo.
 * @param selection - The selection criteria to use to select packages.
 * @returns An array containing the selected packages.
 */
const selectPackagesFromRepo = async (
	fluidRepo: IFluidRepo,
	selection: PackageSelectionCriteria,
): Promise<Set<IPackage>> => {
	const selected: Set<IPackage> = new Set();

	if (selection.changedSinceBranch !== undefined) {
		const git = await fluidRepo.getGitRepository();
		const remote = await getRemote(git, fluidRepo.upstreamRemotePartialUrl);
		if (remote === undefined) {
			throw new Error(`Can't find a remote with ${fluidRepo.upstreamRemotePartialUrl}`);
		}
		const { packages } = await getChangedSinceRef(
			fluidRepo,
			selection.changedSinceBranch,
			remote,
		);
		addAllToSet(selected, packages);
	}

	if (selection.directory !== undefined) {
		const repoRelativePath = path.join(
			selection.directory === "." ? process.cwd() : selection.directory,
		);

		const dirPackage = [...fluidRepo.packages.values()].find(
			(p) => fluidRepo.relativeToRepo(p.directory) === repoRelativePath,
		);
		if (dirPackage === undefined) {
			throw new Error(`Cannot find package with directory: ${repoRelativePath}`);
		}
		selected.add(dirPackage);
		return selected;
	}

	// Select workspace and workspace root packages
	for (const workspace of fluidRepo.workspaces.values()) {
		if (selection.workspaces.length > 0 && mm.isMatch(workspace.name, selection.workspaces)) {
			addAllToSet(
				selected,
				workspace.packages.filter((p) => !p.isWorkspaceRoot),
			);
		}

		if (
			selection.workspaceRoots.length > 0 &&
			mm.isMatch(workspace.name, selection.workspaceRoots)
		) {
			addAllToSet(
				selected,
				workspace.packages.filter((p) => p.isWorkspaceRoot),
			);
		}
	}

	// Select release group and release group root packages
	for (const releaseGroup of fluidRepo.releaseGroups.values()) {
		if (
			selection.releaseGroups.length > 0 &&
			mm.isMatch(releaseGroup.name, selection.releaseGroups)
		) {
			addAllToSet(
				selected,
				releaseGroup.packages.filter((p) => !p.isReleaseGroupRoot),
			);
		}

		if (
			selection.releaseGroupRoots.length > 0 &&
			mm.isMatch(releaseGroup.name, selection.releaseGroupRoots)
		) {
			addAllToSet(
				selected,
				releaseGroup.packages.filter((p) => p.isReleaseGroupRoot),
			);
		}
	}

	return selected;
};

/**
 * Selects packages from the Fluid repo based on the selection criteria. The selected packages will be filtered by the
 * filter criteria if provided.
 *
 * @param fluidRepo - The Fluid repo.
 * @param selection - The selection criteria to use to select packages.
 * @param filter - An optional filter criteria to filter selected packages by.
 * @returns An object containing the selected packages and the filtered packages.
 */
export async function selectAndFilterPackages(
	fluidRepo: IFluidRepo,
	selection: PackageSelectionCriteria,
	filter?: PackageFilterOptions,
): Promise<{ selected: IPackage[]; filtered: IPackage[] }> {
	// Select the packages from the repo
	const selected = [...(await selectPackagesFromRepo(fluidRepo, selection))];

	// Filter resulting list if needed
	const filtered = filter === undefined ? selected : await filterPackages(selected, filter);

	return { selected, filtered };
}

/**
 * Convenience type that extracts only the properties of a package that are needed for filtering.
 */
type FilterablePackage = Pick<IPackage, "name" | "private">;

/**
 * Filters a list of packages by the filter criteria.
 *
 * @param packages - An array of packages to be filtered.
 * @param filters - The filter criteria to filter the packages by.
 * @typeParam T - The type of the package-like objects being filtered.
 * @returns An array containing only the filtered items.
 */
export async function filterPackages<T extends FilterablePackage>(
	packages: T[],
	filters: PackageFilterOptions,
): Promise<T[]> {
	const filtered = packages.filter((pkg) => {
		if (filters === undefined) {
			return true;
		}

		const isPrivate: boolean = pkg.private ?? false;
		if (filters.private !== undefined && filters.private !== isPrivate) {
			return false;
		}

		const scopeIn = scopesToPrefix(filters?.scope);
		const scopeOut = scopesToPrefix(filters?.skipScope);

		if (scopeIn !== undefined) {
			let found = false;
			for (const scope of scopeIn) {
				found ||= pkg.name.startsWith(scope);
			}
			if (!found) {
				return false;
			}
		}
		if (scopeOut !== undefined) {
			for (const scope of scopeOut) {
				if (pkg.name.startsWith(scope) === true) {
					return false;
				}
			}
		}
		return true;
	});

	return filtered;
}

function scopesToPrefix(scopes: string[] | undefined): string[] | undefined {
	return scopes === undefined ? undefined : scopes.map((s) => `${s}/`);
}

/**
 * Adds all the items of an iterable to a set.
 *
 * @param set - The set to which items will be added.
 * @param iterable - The iterable containing items to add to the set.
 */
export function addAllToSet<T>(set: Set<T>, iterable: Iterable<T>): void {
	for (const item of iterable) {
		set.add(item);
	}
}