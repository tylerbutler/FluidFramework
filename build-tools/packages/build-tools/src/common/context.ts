/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { commonOptions } from "../common/commonOptions";
import { FluidRepo, IFluidBuildConfig } from "../common/fluidRepo";
import { getFluidBuildConfig } from "../common/fluidUtils";
import { Package } from "../common/npmPackage";
import { Timer } from "../common/timer";
import { GitRepo } from "./gitRepo";
import { fatal } from "./utils";

/**
 * Context provides access to data about the Fluid repo, and exposes methods to interrogate the repo state.
 *
 * @internal
 */
export class Context {
	public readonly repo: FluidRepo;
	public readonly fullPackageMap: Map<string, Package>;
	public readonly rootFluidBuildConfig: IFluidBuildConfig;

	private readonly timer: Timer;
	private readonly newBranches: string[] = [];

	constructor(
		public readonly gitRepo: GitRepo,
		public readonly originRemotePartialUrl: string,
		public readonly originalBranchName: string,
	) {
		this.timer = new Timer(commonOptions.timer);

		// Load the package
		this.repo = new FluidRepo(this.gitRepo.resolvedRoot);
		this.timer.time("Package scan completed");

		this.fullPackageMap = this.repo.createPackageMap();
		this.rootFluidBuildConfig = getFluidBuildConfig(this.repo.resolvedRoot);
	}

	/**
	 * @deprecated Don't use
	 */
	public async createBranch(branchName: string) {
		if (await this.gitRepo.getShaForBranch(branchName)) {
			fatal(`${branchName} already exists. Failed to create.`);
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
		let packages: Package[];
		if (releaseGroup instanceof Package) {
			packages = this.packages.filter((p) => p.name !== releaseGroup.name);
		} else {
			packages = this.packages.filter((pkg) => pkg.monoRepo?.kind !== releaseGroup);
		}

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
}
