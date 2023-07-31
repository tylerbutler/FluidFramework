/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { FluidRepo, IFluidBuildConfig, VersionDetails } from "./fluidRepo";
import { getFluidBuildConfig } from "./fluidUtils";
import { Logger, defaultLogger } from "./logging";
import { Package } from "./package";
import { Timer } from "./timer";
import { Repository } from "./lib";
import { MonoRepo } from "./monorepo";
import { isReleaseGroup } from "./releaseGroups";
import { PackageName } from "@rushstack/node-core-library";
import { getVersionFromTag } from "./tags";

/**
 * Context provides access to data about the Fluid repo, and exposes methods to interrogate the repo state.
 */
export class Context {
	public readonly repo: FluidRepo;
	public readonly fullPackageMap: Map<string, Package>;
	public readonly rootFluidBuildConfig: IFluidBuildConfig;

	private readonly timer: Timer;

	constructor(
		public readonly gitRepo: Repository,
		public readonly originRemotePartialUrl: string,
		public readonly originalBranchName: string,
		private readonly logger: Logger = defaultLogger,
	) {
		this.timer = new Timer(true, logger);

		// Load the package
		this.repo = new FluidRepo(this.gitRepo.rootPath, logger);
		this.timer.time("Package scan completed");

		this.fullPackageMap = this.repo.createPackageMap();
		this.rootFluidBuildConfig = getFluidBuildConfig(this.repo.resolvedRoot);
	}

	/**
	 * Returns the packages that belong to the specified release group.
	 *
	 * @param releaseGroup - The release group to filter by
	 * @returns An array of packages that belong to the release group
	 */
	public packagesInReleaseGroup(releaseGroup: string): Package[] {
		const packages = this.packages.filter((pkg) => pkg.monoRepo?.kind === releaseGroup);
		return packages;
	}

	/**
	 * Returns the packages that do not belong to the specified release group.
	 *
	 * @param releaseGroup - The release group or package to filter by.
	 * @returns An array of packages that do not belong to the release group.
	 */
	public packagesNotInReleaseGroup(releaseGroup: string | Package): Package[] {
		const packages: Package[] =
			releaseGroup instanceof Package
				? this.packages.filter((p) => p.name !== releaseGroup.name)
				: this.packages.filter((pkg) => pkg.monoRepo?.kind !== releaseGroup);

		return packages;
	}

	/**
	 * @returns An array of packages in the repo that are not associated with a release group.
	 */
	public get independentPackages(): Package[] {
		const packages = this.packages.filter((pkg) => pkg.monoRepo === undefined);
		return packages;
	}

	/**
	 * @returns An array of all packages in the repo.
	 */
	public get packages(): Package[] {
		return [...this.fullPackageMap.values()];
	}

	/**
	 * Takes a packageOrReleaseGroupArg and searches the context for it. Release groups are checked first, then
	 * independent packages by scoped name, then by unscoped name.
	 */
	public findPackageOrReleaseGroup(name: string): Package | MonoRepo | undefined {
		if (isReleaseGroup(name)) {
			return this.repo.releaseGroups.get(name);
		}

		return (
			this.fullPackageMap.get(name) ??
			this.independentPackages.find((pkg) => pkg.nameUnscoped === name)
		);
	}

	private readonly _versions: Map<string, VersionDetails[]> = new Map();

	/**
	 * Gets all the versions for a release group or independent package. This function only considers the tags in the
	 * repo to determine releases and dates.
	 *
	 * @param releaseGroupOrPackage - The release group or independent package to get versions for.
	 * @returns An array of {@link ReleaseDetails} containing the version and date for each version.
	 *
	 * @internal
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

	private readonly _tags: Map<string, string[]> = new Map();

	public async getTagsForReleaseGroup(releaseGroupOrPackage: string): Promise<string[]> {
		const prefix = isReleaseGroup(releaseGroupOrPackage)
			? releaseGroupOrPackage.toLowerCase()
			: PackageName.getUnscopedName(releaseGroupOrPackage);
		const cacheEntry = this._tags.get(prefix);
		if (cacheEntry !== undefined) {
			return cacheEntry;
		}

		const tagList = await this.gitRepo.getTags(`${prefix}_v*`);
		return tagList;
	}
}
