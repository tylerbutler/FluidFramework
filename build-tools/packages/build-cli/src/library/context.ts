/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { PackageName as PackageNameApi } from "@rushstack/node-core-library";
import * as semver from "semver";

import {
	type IFluidRepo,
	type IFluidRepoLayout,
	type IPackage,
	type PackageName,
	type ReleaseGroupName,
	loadFluidRepo,
} from "@fluid-tools/build-infrastructure";
import { ReleaseVersion } from "@fluid-tools/version-tools";
import {
	// FluidRepo,
	GitRepo,
	type IFluidBuildConfig,
	// Package,
	getFluidBuildConfig,
} from "@fluidframework/build-tools";

import path from "node:path";
import { type FlubConfig, getFlubConfig } from "../config.js";
import {
	type Package,
	type ReleaseGroup,
	type ReleaseGroupOrPackage,
	isReleaseGroup,
} from "../releaseGroups.js";
import { getFluidRepoLayout } from "../../../build-infrastructure/lib/config.js";

/**
 * Represents a release version and its release date, if applicable.
 *
 * @internal
 */
export interface VersionDetails {
	/**
	 * The version of the release.
	 */
	version: ReleaseVersion;

	/**
	 * The date the version was released, if applicable.
	 */
	date?: Date;
}

/**
 * Parses the version from a git tag.
 *
 * @param tag - The tag.
 * @returns The version string, or undefined if one could not be found.
 *
 * TODO: Need up reconcile slightly different version in version-tools/src/schemes.ts
 */
function getVersionFromTag(tag: string): string | undefined {
	// This is sufficient, but there is a possibility that this will fail if we add a tag that includes "_v" in its
	// name.
	const tagSplit = tag.split("_v");
	if (tagSplit.length !== 2) {
		return undefined;
	}

	const ver = semver.parse(tagSplit[1]);
	if (ver === null) {
		return undefined;
	}

	return ver.version;
}

/**
 * Represents the different types of release groups supported by the build tools. Each of these groups should be defined
 * in the fluid-build section of the root package.json.
 * @deprecated should switch to ReleaseGroup.  Currently the only difference is "azure" not in ReleaseGroup.
 */
export enum MonoRepoKind {
	Client = "client",
	Server = "server",
	Azure = "azure",
	BuildTools = "build-tools",
	GitRest = "gitrest",
	Historian = "historian",
}

/**
 * A type guard used to determine if a string is a MonoRepoKind.
 * @deprecated should switch to isReleaseGroup
 */
export function isMonoRepoKind(str: string | undefined): str is MonoRepoKind {
	if (str === undefined) {
		return false;
	}

	const list = Object.values<string>(MonoRepoKind);
	const isMonoRepoValue = list.includes(str);
	return isMonoRepoValue;
}

/**
 * Context provides access to data about the Fluid repo, and exposes methods to interrogate the repo state.
 */
export class Context {
	public readonly repo: IFluidRepo;
	// public readonly fullPackageMap: Map<string, IPackage>;
	public readonly fluidBuildConfig: IFluidBuildConfig;
	public readonly flubConfig: FlubConfig;
	public readonly repoLayout: IFluidRepoLayout;
	private readonly newBranches: string[] = [];

	constructor(
		public readonly gitRepo: GitRepo,
		public readonly originRemotePartialUrl: string,
		public readonly originalBranchName: string,
	) {
		// Load the packages
		this.fluidBuildConfig = getFluidBuildConfig(this.gitRepo.resolvedRoot);
		this.flubConfig = getFlubConfig(this.gitRepo.resolvedRoot);
		this.repoLayout = getFluidRepoLayout(this.gitRepo.resolvedRoot);

		// this.repo = new FluidRepo(this.gitRepo.resolvedRoot, this.fluidBuildConfig.repoPackages);
		this.repo = loadFluidRepo();
	}

	/**
	 * Create a branch with name. throw an error if the branch already exist.
	 * @deprecated Use GitRepository instead.
	 */
	public async createBranch(branchName: string): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
		if (await this.gitRepo.getShaForBranch(branchName)) {
			throw new Error(`${branchName} already exists. Failed to create.`);
		}
		await this.gitRepo.createBranch(branchName);
		this.newBranches.push(branchName);
	}

	/**
	 * Returns the packages that belong to the specified release group.
	 *
	 * @param releaseGroup - The release group to filter by
	 * @returns An array of packages that belong to the release group
	 */
	public packagesInReleaseGroup(releaseGroup: ReleaseGroupName): IPackage[] {
		const rg = this.repo.releaseGroups.get(releaseGroup);
		if (rg === undefined) {
			throw new Error(`Unknown release group: ${releaseGroup}`);
		}
		return rg.packages;
	}

	/**
	 * Returns the packages that do not belong to the specified release group.
	 *
	 * @param releaseGroup - The release group or package to filter by.
	 * @returns An array of packages that do not belong to the release group.
	 */
	public packagesNotInReleaseGroup(releaseGroup: ReleaseGroup | ReleaseGroupName): IPackage[] {
		const packages: Package[] = [];
		const filterName = typeof releaseGroup === "string" ? releaseGroup : releaseGroup.name;

		for (const rg of this.repo.releaseGroups.values()) {
			if (rg.name !== filterName) {
				packages.push(...rg.packages);
			}
		}

		return packages;
	}

	/**
	 * Get all the packages in release groups with only one package.
	 * @returns An array of packages in the repo that are not associated with a release group.
	 *
	 * @deprecated The concept of independent packages is going away.
	 */
	public get independentPackages(): Package[] {
		const packages: Package[] = [];
		for (const rg of this.repo.releaseGroups.values()) {
			if (rg.packages.length === 1) {
				packages.push(...rg.packages);
			}
		}
		return packages;
	}

	/**
	 * Get all the packages.
	 * @returns An array of all packages in the repo.
	 */
	public get packages(): IPackage[] {
		return [...this.repo.packages.values()];
	}

	/**
	 * Gets the version for a package or release group.
	 *
	 * @returns A version string.
	 *
	 */
	public getVersion(key: ReleaseGroupName | PackageName): string {
		let ver = "";

		const rgRepo = this.repo.releaseGroups.get(key as ReleaseGroupName);
		if (rgRepo !== undefined) {
			return rgRepo.packages[0].version;
		}

		const pkg = this.repo.packages.get(key as PackageName);
		if (pkg === undefined) {
			throw new Error(`Package not in context: ${key}`);
		}
		ver = pkg.version;
		return ver;
	}

	private readonly _tags: Map<string, string[]> = new Map();

	/**
	 * Returns an array of all the git tags associated with a release group.
	 *
	 * @param releaseGroupOrPackage - The release group or independent package to get tags for.
	 * @returns An array of all all the tags for the release group or package.
	 */
	public async getTagsForReleaseGroup(
		releaseGroupOrPackage: PackageName | ReleaseGroupName,
	): Promise<string[]> {
		const prefix = isReleaseGroup(releaseGroupOrPackage)
			? releaseGroupOrPackage.name.toLowerCase()
			: PackageNameApi.getUnscopedName(releaseGroupOrPackage as string);

		const cacheEntry = this._tags.get(prefix);
		if (cacheEntry !== undefined) {
			return cacheEntry;
		}

		const tagList = await this.gitRepo.getAllTags(`${prefix}_v*`);
		return tagList;
	}

	private readonly _versions: Map<ReleaseGroupName | PackageName, VersionDetails[]> =
		new Map();

	/**
	 * Gets all the versions for a release group or independent package. This function only considers the tags in the
	 * repo to determine releases and dates.
	 *
	 * @param releaseGroupOrPackage - The release group or independent package to get versions for.
	 * @returns An array of {@link ReleaseDetails} containing the version and date for each version.
	 */
	public async getAllVersions(
		releaseGroupOrPackage: ReleaseGroupName | PackageName,
	): Promise<VersionDetails[] | undefined> {
		const cacheEntry = this._versions.get(releaseGroupOrPackage);
		if (cacheEntry !== undefined) {
			return cacheEntry;
		}

		const versions = new Map<string, Date>();
		const tags = await this.getTagsForReleaseGroup(releaseGroupOrPackage);

		for (const tag of tags) {
			const ver = getVersionFromTag(tag);
			if (ver !== undefined && ver !== "" && ver !== null) {
				// eslint-disable-next-line no-await-in-loop
				const date = await this.gitRepo.getCommitDate(tag);
				versions.set(ver, date);
			}
		}

		if (versions.size === 0) {
			return undefined;
		}

		const toReturn: VersionDetails[] = [];
		for (const [version, date] of versions) {
			toReturn.push({ version, date });
		}

		this._versions.set(releaseGroupOrPackage, toReturn);
		return toReturn;
	}

	/**
	 * Transforms an absolute path to a path relative to the repo root.
	 *
	 * @param p - The path to make relative to the repo root.
	 * @returns the relative path.
	 */
	public relativeToRepo(p: string): string {
		// Replace \ in result with / in case OS is Windows.
		return path.relative(this.repo.root, p).replace(/\\/g, "/");
	}
}
