/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { DEFAULT_INTERDEPENDENCY_RANGE, InterdependencyRange } from "@fluid-tools/version-tools";
import { getPackagesSync } from "@manypkg/get-packages";
import { readFileSync, readJsonSync } from "fs-extra";
import { existsSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

import { execWithErrorAsync } from "./exec";
import { IFluidBuildConfig, IFluidRepoPackage } from "./fluidRepo";
import { Logger, defaultLogger } from "./logging";
import { Package, PackageJson, PackageManager } from "./package";

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
export type ReleasePackageName = string;

/**
 * An array of known release groups.
 *
 * @internal
 */
export const knownReleaseGroups = [
	"build-tools",
	"client",
	"server",
	"gitrest",
	"historian",
] as const;

/**
 * A type that represents release groups.
 *
 * @internal
 */
export type ReleaseGroupName = typeof knownReleaseGroups[number] | string;

/**
 * A type guard used to determine if a string is a ReleaseGroup.
 *
 * @internal
 */
export function isReleaseGroup(str: string | undefined): str is ReleaseGroupName {
	return str === undefined ? false : knownReleaseGroups.includes(str as any);
}

/**
 * A release group is a collection of packages that are versioned and released together.
 *
 * @remarks
 *
 * A release group is configured using either package.json or lerna.json. The files are checked in the following way:
 *
 * - If lerna.json exists, it is checked for a `packages` AND a `version` field.
 *
 * - If lerna.json contains BOTH of those fields, then the values in lerna.json will be used. Package.json will not be
 * read.
 *
 * - If lerna.json contains ONLY the version field, it will be used.
 *
 * - Otherwise, if package.json exists, it is checked for a `workspaces` field and a `version` field.
 *
 * - If package.json contains a workspaces field, then packages will be loaded based on the globs in that field.
 *
 * - If the version was not defined in lerna.json, then the version value in package.json will be used.
 */
export class ReleaseGroup {
	public readonly packages: Package[] = [];
	public readonly version: string;
	public readonly workspaceGlobs: string[];
	private readonly _packageJson: PackageJson;

	static load(
		group: string,
		repoPackage: IFluidRepoPackage,
		log: Logger,
	): ReleaseGroup | undefined {
		const { directory, ignoredDirs, defaultInterdependencyRange } = repoPackage;
		let packageManager: PackageManager;
		let packageDirs: string[];

		try {
			const { tool, rootDir, packages } = getPackagesSync(directory);
			if (path.resolve(rootDir) !== directory) {
				// This is a sanity check. directory is the path passed in when creating the ReleaseGroup object, while rootDir
				// is the dir that manypkg found. They should be the same.
				throw new Error(`rootDir ${rootDir} does not match repoPath ${directory}`);
			}
			switch (tool.type) {
				case "lerna":
					// Treat lerna as "npm"
					packageManager = "npm";
					break;
				case "npm":
				case "pnpm":
				case "yarn":
					packageManager = tool.type;
					break;
				default:
					throw new Error(`Unknown package manager ${tool.type}`);
			}
			if (packages.length === 1 && packages[0].dir === directory) {
				// this is an independent package
				return;
			}
			packageDirs = packages.filter((pkg) => pkg.relativeDir !== ".").map((pkg) => pkg.dir);

			if (defaultInterdependencyRange === undefined) {
				log?.warning(
					`No defaultinterdependencyRange specified for ${group} release group. Defaulting to "${DEFAULT_INTERDEPENDENCY_RANGE}".`,
				);
			}
		} catch {
			return;
		}

		return new ReleaseGroup(
			group,
			directory,
			defaultInterdependencyRange ?? DEFAULT_INTERDEPENDENCY_RANGE,
			packageManager,
			packageDirs,
			ignoredDirs,
			log,
		);
	}

	/**
	 * Creates a new ReleaseGroup.
	 *
	 * @param name - The name of the release group.
	 * @param repoPath - The path on the filesystem to the release group root. This location is expected to have either a
	 * package.json file with a workspaces field, or a lerna.json file with a packages field.
	 * @param ignoredDirs - Paths to ignore when loading the release group packages.
	 */
	// eslint-disable-next-line max-params
	constructor(
		public readonly name: string,
		public readonly repoPath: string,
		public readonly interdependencyRange: InterdependencyRange,
		private readonly packageManager: PackageManager,
		packageDirs: string[],
		ignoredDirs?: string[],
		private readonly logger: Logger = defaultLogger,
	) {
		this.version = "";
		this.workspaceGlobs = [];
		const pnpmWorkspace = path.join(repoPath, "pnpm-workspace.yaml");
		const lernaPath = path.join(repoPath, "lerna.json");
		const yarnLockPath = path.join(repoPath, "yarn.lock");
		const packagePath = path.join(repoPath, "package.json");
		let versionFromLerna = false;

		if (!existsSync(packagePath)) {
			throw new Error(`ERROR: package.json not found in ${repoPath}`);
		}

		this._packageJson = readJsonSync(packagePath);

		const validatePackageManager = existsSync(pnpmWorkspace)
			? "pnpm"
			: existsSync(yarnLockPath)
			? "yarn"
			: "npm";

		if (this.packageManager !== validatePackageManager) {
			throw new Error(
				`Package manager mismatch between ${packageManager} and ${validatePackageManager}`,
			);
		}

		if (existsSync(lernaPath)) {
			const lerna = readJsonSync(lernaPath);
			if (packageManager === "pnpm") {
				const workspaceString = readFileSync(pnpmWorkspace, "utf-8");
				this.workspaceGlobs = YAML.parse(workspaceString).packages;
			} else if (lerna.packages !== undefined) {
				this.workspaceGlobs = lerna.packages;
			}

			if (lerna.version !== undefined) {
				logger.verbose(`${name}: Loading version (${lerna.version}) from ${lernaPath}`);
				this.version = lerna.version;
				versionFromLerna = true;
			}
		} else {
			// Load globs from package.json directly
			this.workspaceGlobs = Array.isArray(this._packageJson.workspaces)
				? this._packageJson.workspaces
				: (this._packageJson.workspaces as any).packages;
		}

		if (!versionFromLerna) {
			this.version = this._packageJson.version;
			logger.verbose(
				`${name}: Loading version (${this._packageJson.version}) from ${packagePath}`,
			);
		}

		logger.verbose(`${name}: Loading packages from ${packageManager}`);
		for (const pkgDir of packageDirs) {
			this.packages.push(Package.load(path.join(pkgDir, "package.json"), name, this));
		}
	}

	public static isSame(a: ReleaseGroup | undefined, b: ReleaseGroup | undefined) {
		return a !== undefined && a === b;
	}

	public get installCommand(): string {
		return this.packageManager === "pnpm"
			? "pnpm i"
			: this.packageManager === "yarn"
			? "npm run install-strict"
			: "npm i --no-package-lock --no-shrinkwrap";
	}

	public get fluidBuildConfig(): IFluidBuildConfig | undefined {
		return this._packageJson.fluidBuild;
	}

	public getNodeModulePath() {
		return path.join(this.repoPath, "node_modules");
	}

	public async install() {
		this.logger.info(`${this.name}: Installing - ${this.installCommand}`);
		return execWithErrorAsync(this.installCommand, { cwd: this.repoPath }, this.repoPath);
	}
	// public async uninstall() {
	// 	return rimrafWithErrorAsync(this.getNodeModulePath(), this.repoPath);
	// }
}

/**
 * A type that represents where a release can originate. Most release groups use the releaseBranches value, and
 * individual packages use the direct value, which indicates releases originate from the main/lts branches. The
 * interactive value means the user should be asked to define the source dynamically.
 */
export type ReleaseSource = "direct" | "releaseBranches" | "interactive";
