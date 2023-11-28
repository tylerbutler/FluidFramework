/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import * as path from "path";

import {
	DEFAULT_INTERDEPENDENCY_RANGE,
	InterdependencyRange,
	ReleaseVersion,
	VersionBumpType,
} from "@fluid-tools/version-tools";
import { PackageName } from "@rushstack/node-core-library";

import { getFluidBuildConfig } from "./fluidUtils";
import { Workspace, isMonoRepoKind } from "./monoRepo";
import { Package, Packages } from "./npmPackage";
import { ExecAsyncResult } from "./utils";
import { TaskDefinitionsOnDisk } from "./fluidTaskDefinitions";
import { getVersionFromTag } from "./tags";
import { GitRepo } from "./gitRepo";

import registerDebug from "debug";
const traceInit = registerDebug("fluid-build:init");

/**
 * Fluid build configuration that is expected in the repo-root package.json.
 *
 * @internal
 */
export interface IFluidBuildConfig {
	/**
	 * Build tasks and dependencies definitions
	 */
	tasks?: TaskDefinitionsOnDisk;

	/**
	 * A mapping of package or release group names to metadata about the package or release group. This can only be
	 * configured in the repo-wide Fluid build config (the repo-root package.json).
	 */
	repoPackages?: {
		[name: string]: IFluidRepoPackageEntry;
	};

	/**
	 * Policy configuration for the `check:policy` command. This can only be configured in the rrepo-wide Fluid build
	 * config (the repo-root package.json).
	 */
	policy?: PolicyConfig;

	/**
	 * Configuration for assert tagging.
	 */
	assertTagging?: AssertTaggingConfig;

	/**
	 * A mapping of branch names to previous version baseline styles. The type test generator takes this information
	 * into account when calculating the baseline version to use when it's run on a particular branch. If this is not
	 * defined for a branch or package, then that package will be skipped during type test generation.
	 */
	branchReleaseTypes?: {
		[name: string]: VersionBumpType | PreviousVersionStyle;
	};
}

/**
 * A type representing the different version constraint styles we use when determining the previous version for type
 * test generation.
 *
 * The "base" versions are calculated by zeroing out all version segments lower than the base. That is, for a version v,
 * the baseMajor version is `${v.major}.0.0` and the baseMinor version is `${v.major}.${v.minor}.0`.
 *
 * The "previous" versions work similarly, but the major/minor/patch segment is reduced by 1. That is, for a version v,
 * the previousMajor version is `${min(v.major - 1, 1)}.0.0`, the previousMinor version is
 * `${v.major}.${min(v.minor - 1, 0)}.0`, and the previousPatch is `${v.major}.${v.minor}.${min(v.patch - 1, 0)}.0`.
 *
 * The "previous" versions never roll back below 1 for the major version and 0 for minor and patch. That is, the
 * previousMajor, previousMinor, and previousPatch versions for `1.0.0` are all `1.0.0`.
 *
 * @example
 *
 * ```text
 * Given the version 2.3.5:
 *
 * baseMajor: 2.0.0
 * baseMinor: 2.3.0
 * ~baseMinor: ~2.3.0
 * previousPatch: 2.3.4
 * previousMinor: 2.2.0
 * previousMajor: 1.0.0
 * ^previousMajor: ^1.0.0
 * ^previousMinor: ^2.2.0
 * ~previousMajor: ~1.0.0
 * ~previousMinor: ~2.2.0
 * ```
 *
 * @example
 *
 * ```text
 * Given the version 2.0.0-internal.2.3.5:
 *
 * baseMajor: 2.0.0-internal.2.0.0
 * baseMinor: 2.0.0-internal.2.3.0
 * ~baseMinor: >=2.0.0-internal.2.3.0 <2.0.0-internal.3.0.0
 * previousPatch: 2.0.0-internal.2.3.4
 * previousMinor: 2.0.0-internal.2.2.0
 * previousMajor: 2.0.0-internal.1.0.0
 * ^previousMajor: >=2.0.0-internal.1.0.0 <2.0.0-internal.2.0.0
 * ^previousMinor: >=2.0.0-internal.2.2.0 <2.0.0-internal.3.0.0
 * ~previousMajor: >=2.0.0-internal.1.0.0 <2.0.0-internal.1.1.0
 * ~previousMinor: >=2.0.0-internal.2.2.0 <2.0.0-internal.2.2.0
 * ```
 *
 * @example
 *
 * ```text
 * Given the version 2.0.0-internal.2.0.0:
 *
 * baseMajor: 2.0.0-internal.2.0.0
 * baseMinor: 2.0.0-internal.2.0.0
 * ~baseMinor: >=2.0.0-internal.2.0.0 <2.0.0-internal.2.1.0
 * previousPatch: 2.0.0-internal.2.0.0
 * previousMinor: 2.0.0-internal.2.0.0
 * previousMajor: 2.0.0-internal.1.0.0
 * ^previousMajor: >=2.0.0-internal.1.0.0 <2.0.0-internal.2.0.0
 * ^previousMinor: >=2.0.0-internal.2.0.0 <2.0.0-internal.3.0.0
 * ~previousMajor: >=2.0.0-internal.1.0.0 <2.0.0-internal.1.1.0
 * ~previousMinor: >=2.0.0-internal.2.0.0 <2.0.0-internal.2.1.0
 * ```
 *
 * @internal
 */
export type PreviousVersionStyle =
	| "baseMajor"
	| "baseMinor"
	| "previousPatch"
	| "previousMinor"
	| "previousMajor"
	| "~baseMinor"
	| "^previousMajor"
	| "^previousMinor"
	| "~previousMajor"
	| "~previousMinor";

/**
 * Policy configuration for the `check:policy` command.
 */
export interface PolicyConfig {
	additionalLockfilePaths?: string[];
	pnpmSinglePackageWorkspace?: string[];
	fluidBuildTasks: {
		tsc: {
			ignoreTasks: string[];
			ignoreDependencies: string[];
			ignoreDevDependencies: string[];
		};
	};
	dependencies?: {
		commandPackages: [string, string][];
	};
	/**
	 * An array of strings/regular expressions. Paths that match any of these expressions will be completely excluded from
	 * policy-check.
	 */
	exclusions?: string[];

	/**
	 * An object with handler name as keys that maps to an array of strings/regular expressions to
	 * exclude that rule from being checked.
	 */
	handlerExclusions?: { [rule: string]: string[] };

	packageNames?: PackageNamePolicyConfig;
}

export interface AssertTaggingConfig {
	assertionFunctions: { [functionName: string]: number };

	/**
	 * An array of paths under which assert tagging applies to. If this setting is provided, only packages whose paths
	 * match the regular expressions in this setting will be assert-tagged.
	 */
	enabledPaths?: RegExp[];
}

/**
 * Configuration for package naming and publication policies.
 */
export interface PackageNamePolicyConfig {
	/**
	 * A list of package scopes that are permitted in the repo.
	 */
	allowedScopes?: string[];
	/**
	 * A list of packages that have no scope.
	 */
	unscopedPackages?: string[];
	/**
	 * Packages that must be published.
	 */
	mustPublish: {
		/**
		 * A list of package names or scopes that must publish to npm, and thus should never be marked private.
		 */
		npm?: string[];

		/**
		 * A list of package names or scopes that must publish to an internal feed, and thus should always be marked
		 * private.
		 */
		internalFeed?: string[];
	};

	/**
	 * Packages that may or may not be published.
	 */
	mayPublish: {
		/**
		 * A list of package names or scopes that may publish to npm, and thus might or might not be marked private.
		 */
		npm?: string[];

		/**
		 * A list of package names or scopes that must publish to an internal feed, and thus might or might not be marked
		 * private.
		 */
		internalFeed?: string[];
	};
}

/**
 * Metadata about known-broken types.
 */
export interface BrokenCompatSettings {
	backCompat?: false;
	forwardCompat?: false;
}

/**
 * A mapping of a type name to its {@link BrokenCompatSettings}.
 */
export type BrokenCompatTypes = Partial<Record<string, BrokenCompatSettings>>;

export interface ITypeValidationConfig {
	/**
	 * An object containing types that are known to be broken.
	 */
	broken: BrokenCompatTypes;

	/**
	 * If true, disables type test preparation and generation for the package.
	 */
	disabled?: boolean;
}

/**
 * Configures a package or release group
 */
export interface IFluidRepoPackage {
	/**
	 * The path to the package. For release groups this should be the path to the root of the release group.
	 */
	directory: string;

	/**
	 * An array of paths under `directory` that should be ignored.
	 */
	ignoredDirs?: string[];

	/**
	 * The interdependencyRange controls the type of semver range to use between packages in the same release group. This
	 * setting controls the default range that will be used when updating the version of a release group. The default can
	 * be overridden using the `--interdependencyRange` flag in the `flub bump` command.
	 */
	defaultInterdependencyRange: InterdependencyRange;
}

export type IFluidRepoPackageEntry = string | IFluidRepoPackage | (string | IFluidRepoPackage)[];

export class FluidRepo {
	private readonly monoRepos = new Map<string, Workspace>();
	private readonly gitRepo: GitRepo;

	public get releaseGroups() {
		return this.monoRepos;
	}

	public readonly packages: Packages;

	constructor(public readonly resolvedRoot: string) {
		const packageManifest = getFluidBuildConfig(resolvedRoot);
		this.gitRepo = new GitRepo(resolvedRoot);
		// Expand to full IFluidRepoPackage and full path
		const normalizeEntry = (
			item: IFluidRepoPackageEntry,
		): IFluidRepoPackage | IFluidRepoPackage[] => {
			if (Array.isArray(item)) {
				return item.map((entry) => normalizeEntry(entry) as IFluidRepoPackage);
			}
			if (typeof item === "string") {
				traceInit(
					`No defaultInterdependencyRange setting found for '${item}'. Defaulting to "${DEFAULT_INTERDEPENDENCY_RANGE}".`,
				);
				return {
					directory: path.join(resolvedRoot, item),
					ignoredDirs: undefined,
					defaultInterdependencyRange: DEFAULT_INTERDEPENDENCY_RANGE,
				};
			}
			const directory = path.join(resolvedRoot, item.directory);
			return {
				directory,
				ignoredDirs: item.ignoredDirs?.map((dir) => path.join(directory, dir)),
				defaultInterdependencyRange: item.defaultInterdependencyRange,
			};
		};
		const loadOneEntry = (item: IFluidRepoPackage, group: string) => {
			return Packages.loadDir(item.directory, group, item.ignoredDirs);
		};

		const loadedPackages: Package[] = [];
		for (const group in packageManifest.repoPackages) {
			const item = normalizeEntry(packageManifest.repoPackages[group]);
			if (Array.isArray(item)) {
				for (const i of item) {
					loadedPackages.push(...loadOneEntry(i, group));
				}
				continue;
			}
			const monoRepo = Workspace.load(group, item);
			if (monoRepo) {
				this.releaseGroups.set(group, monoRepo);
				loadedPackages.push(...monoRepo.packages);
			} else {
				loadedPackages.push(...loadOneEntry(item, group));
			}
		}
		this.packages = new Packages(loadedPackages);
	}

	private _fullPackageMap: Map<string, Package> | undefined;
	public fullPackageMap(recreate = false) {
		if (this._fullPackageMap === undefined || recreate) {
			this._fullPackageMap = this.createPackageMap();
		}
		return this._fullPackageMap;
	}
	public createPackageMap() {
		return new Map<string, Package>(this.packages.packages.map((pkg) => [pkg.name, pkg]));
	}

	public getVersion(packageOrReleaseGroup: string): string {
		const releaseGroup = this.releaseGroups.get(packageOrReleaseGroup);
		if (releaseGroup === undefined) {
			const pkg = this.fullPackageMap().get(packageOrReleaseGroup);
			if (pkg === undefined) {
				throw new Error(`Package or release group not found: ${packageOrReleaseGroup}`);
			}
			return pkg.version;
		}

		return releaseGroup.version;
	}

	private _versions: Map<string, VersionDetails[]> = new Map();

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

	private _tags: Map<string, string[]> = new Map();

	/**
	 * Returns an array of all the git tags associated with a release group.
	 *
	 * @param releaseGroupOrPackage - The release group or independent package to get tags for.
	 * @returns An array of all all the tags for the release group or package.
	 *
	 * @internal
	 */
	public async getTagsForReleaseGroup(releaseGroupOrPackage: string): Promise<string[]> {
		const prefix = isMonoRepoKind(releaseGroupOrPackage)
			? releaseGroupOrPackage.toLowerCase()
			: PackageName.getUnscopedName(releaseGroupOrPackage);
		const cacheEntry = this._tags.get(prefix);
		if (cacheEntry !== undefined) {
			return cacheEntry;
		}

		const tagList = await this.gitRepo.getAllTags(`${prefix}_v*`);
		return tagList;
	}

	public reload() {
		this.packages.packages.forEach((pkg) => pkg.reload());
	}

	public static async ensureInstalled(packages: Package[]) {
		const installedMonoRepo = new Set<Workspace>();
		const installPromises: Promise<ExecAsyncResult>[] = [];
		for (const pkg of packages) {
			if (pkg.monoRepo) {
				if (!installedMonoRepo.has(pkg.monoRepo)) {
					installedMonoRepo.add(pkg.monoRepo);
					installPromises.push(pkg.monoRepo.install());
				}
			} else {
				installPromises.push(pkg.install());
			}
		}
		const rets = await Promise.all(installPromises);
		return !rets.some((ret) => ret.error);
	}

	public async install() {
		return FluidRepo.ensureInstalled(this.packages.packages);
	}

	/**
	 * Transforms an absolute path to a path relative to the repo root.
	 *
	 * @param p - The path to make relative to the repo root.
	 * @returns the relative path.
	 */
	public relativeToRepo(p: string): string {
		// Replace \ in result with / in case OS is Windows.
		return path.relative(this.resolvedRoot, p).replace(/\\/g, "/");
	}
}

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
