/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	FluidRepo,
	GitRepo,
	type IFluidBuildConfig,
	type Package as IFluidBuildPackage,
	getFluidBuildConfig,
} from "@fluidframework/build-tools";
import { PackageName as PackageScope } from "@rushstack/node-core-library";

import type { IFluidRepo, IPackage, IReleaseGroup } from "@fluid-tools/build-infrastructure";
import { type FlubConfig, getFlubConfig } from "../config.js";
import { getVersionFromTag } from "./git.js";
import type { VersionDetails } from "./release.js";

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
 *
 * @deprecated Use the IFluidRepo instead.
 */
export class Context {
	public readonly repo: FluidRepo;
	public readonly fullPackageMap: Map<string, IFluidBuildPackage>;
	public readonly fluidBuildConfig: IFluidBuildConfig;
	public readonly flubConfig: FlubConfig;
	private readonly newBranches: string[] = [];

	constructor(
		public readonly gitRepo: GitRepo,
		public readonly originRemotePartialUrl: string,
		public readonly originalBranchName: string,
	) {
		// Load the packages
		this.fluidBuildConfig = getFluidBuildConfig(this.gitRepo.resolvedRoot);
		this.flubConfig = getFlubConfig(this.gitRepo.resolvedRoot);
		this.repo = new FluidRepo(this.gitRepo.resolvedRoot, this.fluidBuildConfig.repoPackages);
		this.fullPackageMap = this.repo.createPackageMap();
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
	public packagesInReleaseGroup(releaseGroup: string): IFluidBuildPackage[] {
		const packages = this.packages.filter((pkg) => pkg.monoRepo?.kind === releaseGroup);
		return packages;
	}

	/**
	 * Returns the packages that do not belong to the specified release group.
	 *
	 * @param releaseGroup - The release group or package to filter by.
	 * @returns An array of packages that do not belong to the release group.
	 */
	public packagesNotInReleaseGroup(
		releaseGroup: string | IFluidBuildPackage,
	): IFluidBuildPackage[] {
		const packages =
			typeof releaseGroup === "object"
				? this.packages.filter((p) => p.name !== releaseGroup.name)
				: this.packages.filter((pkg) => pkg.monoRepo?.kind !== releaseGroup);
		return packages;
	}

	/**
	 * Get all the packages not associated with a release group
	 * @returns An array of packages in the repo that are not associated with a release group.
	 */
	public get independentPackages(): IFluidBuildPackage[] {
		const packages = this.packages.filter((pkg) => pkg.monoRepo === undefined);
		return packages;
	}

	/**
	 * Get all the packages.
	 * @returns An array of all packages in the repo.
	 */
	public get packages(): IFluidBuildPackage[] {
		return [...this.fullPackageMap.values()];
	}

	/**
	 * Gets the version for a package or release group.
	 *
	 * @returns A version string.
	 *
	 */
	public getVersion(key: string): string {
		let ver = "";

		if (isMonoRepoKind(key)) {
			const rgRepo = this.repo.releaseGroups.get(key);
			if (rgRepo === undefined) {
				throw new Error(`Release group not found: ${key}`);
			}
			ver = rgRepo.version;
		} else {
			const pkg = this.fullPackageMap.get(key);
			if (pkg === undefined) {
				throw new Error(`Package not in context: ${key}`);
			}
			ver = pkg.version;
		}
		return ver;
	}

	private readonly _tags: Map<string, string[]> = new Map();

	/**
	 * Returns an array of all the git tags associated with a release group.
	 *
	 * @param releaseGroupOrPackage - The release group or independent package to get tags for.
	 * @returns An array of all all the tags for the release group or package.
	 */
	public async getTagsForReleaseGroup(releaseGroupOrPackage: string): Promise<string[]> {
		const prefix = isMonoRepoKind(releaseGroupOrPackage)
			? releaseGroupOrPackage.toLowerCase()
			: PackageScope.getUnscopedName(releaseGroupOrPackage);
		const cacheEntry = this._tags.get(prefix);
		if (cacheEntry !== undefined) {
			return cacheEntry;
		}

		const tagList = await this.gitRepo.getAllTags(`${prefix}_v*`);
		return tagList;
	}

	private readonly _versions: Map<string, VersionDetails[]> = new Map();

	/**
	 * Gets all the versions for a release group or independent package. This function only considers the tags in the
	 * repo to determine releases and dates.
	 *
	 * @param releaseGroupOrPackage - The release group or independent package to get versions for.
	 * @returns An array of {@link ReleaseDetails} containing the version and date for each version.
	 */
	public async getAllVersions(
		releaseGroupOrPackage: string,
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
}

/**
 * Returns all the packages not in the given release group. Note that release group root and workspace root packages
 * will be included.
 */
export function packagesNotInReleaseGroup(
	repo: IFluidRepo,
	releaseGroup: IReleaseGroup,
): IPackage[] {
	const packages = [...repo.packages.values()].filter(
		(p) => p.releaseGroup !== releaseGroup.name,
	);
	return packages;
}
