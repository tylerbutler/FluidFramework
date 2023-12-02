/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { InterdependencyRange, DEFAULT_INTERDEPENDENCY_RANGE } from "@fluid-tools/version-tools";
import { getPackagesSync } from "@manypkg/get-packages";
import { readFileSync } from "fs-extra";
import * as path from "path";
import YAML from "yaml";

import { IFluidBuildConfig, WorkspaceDefinition } from "./fluidRepo";
import { Logger, defaultLogger } from "./logging";
import { Package } from "./npmPackage";
import { execWithErrorAsync, existsSync, rimrafWithErrorAsync } from "./utils";

import registerDebug from "debug";
const traceInit = registerDebug("fluid-build:init");

export type PackageManager = "npm" | "pnpm" | "yarn";

export type ReleaseGroup = string;

/**
 * Represents the different types of release groups supported by the build tools. Each of these groups should be defined
 * in the fluid-build section of the root package.json.
 * @deprecated Don't use
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
 * @deprecated Don't use
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
 * A workspace is a collection of packages that are versioned and released together.
 *
 * @remarks
 *
 * A monorepo is configured using either package.json or lerna.json. The files are checked in the following way:
 *
 * - If lerna.json exists, it is checked for a `packages` AND a `version` field.
 *
 * - If lerna.json contains BOTH of those fields, then the values in lerna.json will be used. Package.json will not be
 *   read.
 *
 * - If lerna.json contains ONLY the version field, it will be used.
 *
 * - Otherwise, if package.json exists, it is checked for a `workspaces` field and a `version` field.
 *
 * - If package.json contains a workspaces field, then packages will be loaded based on the globs in that field.
 *
 * - If the version was not defined in lerna.json, then the version value in package.json will be used.
 *
 * @internal
 */
export class Workspace {
	public readonly packages: Package[] = [];
	public readonly version: string;
	public readonly workspaceGlobs: string[];
	public readonly pkg: Package;

	// public get name(): string {
	// 	return this.name;
	// }

	/**
	 * The directory of the root of the release group.
	 */
	public get directory(): string {
		return this.repoPath;
	}

	public get releaseGroup(): "build-tools" | "client" | "server" | "gitrest" | "historian" {
		return this.name as "build-tools" | "client" | "server" | "gitrest" | "historian";
	}

	static load(
		group: string,
		workspaceDefinition: WorkspaceDefinition,
		repoRoot: string,
	): Workspace {
		const { directory: origDirectory, defaultInterdependencyRange } = workspaceDefinition;
		const directory = path.join(repoRoot, origDirectory);
		let packageManager: PackageManager;

		const { tool, rootDir, packages } = getPackagesSync(directory);
		if (path.resolve(rootDir) !== directory) {
			// This is a sanity check. directory is the path passed in when creating the MonoRepo object, while rootDir is
			// the dir that manypkg found. They should be the same.
			throw new Error(
				`rootDir ${rootDir} does not match repoPath ${directory} (resolved from ${origDirectory})`,
			);
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
			throw new Error(
				`Found a single package '${packages[0].packageJson.name}' unexpectedly.`,
			);
		}
		const packageDirs: string[] = packages
			.filter((pkg) => pkg.relativeDir !== ".")
			.map((pkg) => pkg.dir);
		// packageDirs.unshift(directory);
		// console.debug(packageDirs.slice(5));

		if (defaultInterdependencyRange === undefined) {
			traceInit(
				`No defaultinterdependencyRange specified for ${group} release group. Defaulting to "${DEFAULT_INTERDEPENDENCY_RANGE}".`,
			);
		}

		return new Workspace(
			group,
			directory,
			defaultInterdependencyRange ?? DEFAULT_INTERDEPENDENCY_RANGE,
			packageManager,
			packageDirs,
		);
	}

	/**
	 * Creates a new monorepo.
	 *
	 * @param name - The name of the workspace.
	 * @param repoPath - The path on the filesystem to the monorepo. This location is expected to have either a
	 * package.json file with a workspaces field, or a lerna.json file with a packages field.
	 */
	constructor(
		public readonly name: string,
		public readonly repoPath: string,
		public readonly interdependencyRange: InterdependencyRange,
		public readonly packageManager: PackageManager,
		packageDirs: string[],
		private readonly logger: Logger = defaultLogger,
	) {
		this.version = "";
		this.workspaceGlobs = [];

		const packagePath = path.join(repoPath, "package.json");

		if (!existsSync(packagePath)) {
			throw new Error(`ERROR: package.json not found in ${repoPath}`);
		}

		for (const pkgDir of packageDirs) {
			traceInit(`${name}: Loading packages from ${pkgDir}`);
			this.packages.push(Package.load(path.join(pkgDir, "package.json"), name, this));
		}

		this.pkg = Package.load(packagePath, undefined, this);

		// const rootPackage = this.packages.find((pkg) => {
		// 	return pkg.packageJsonFileName === packagePath;
		// });
		// if (rootPackage === undefined) {
		// 	throw new Error(`Can't find root package for workspace '${name}'`);
		// }
		// this.pkg = rootPackage;

		if (this.packageManager !== this.pkg.packageManager) {
			throw new Error(
				`Package manager mismatch between ${packageManager} and ${this.pkg.packageManager}`,
			);
		}

		// only needed for bump tools
		// const lernaPath = path.join(repoPath, "lerna.json");
		// if (existsSync(lernaPath)) {
		// 	const lerna = readJsonSync(lernaPath);
		if (packageManager === "pnpm") {
			const pnpmWorkspace = path.join(repoPath, "pnpm-workspace.yaml");
			const workspaceString = readFileSync(pnpmWorkspace, "utf-8");
			this.workspaceGlobs = YAML.parse(workspaceString).packages;
		}
		// } else if (lerna.packages !== undefined) {
		// 	this.workspaceGlobs = lerna.packages;
		// }

		// if (lerna.version !== undefined) {
		// 	traceInit(`${kind}: Loading version (${lerna.version}) from ${lernaPath}`);
		// 	this.version = lerna.version;
		// 	versionFromLerna = true;
		// }
		// } else {
		// 	// Load globs from package.json directly
		// 	if (this.pkg.packageJson.workspaces instanceof Array) {
		// 		this.workspaceGlobs = this.pkg.packageJson.workspaces;
		// 	} else {
		// 		this.workspaceGlobs = (this.pkg.packageJson.workspaces as any).packages;
		// 	}
		// }

		// if (!versionFromLerna) {
		// 	this.version = this.pkg.packageJson.version;
		// 	traceInit(
		// 		`${kind}: Loading version (${this.pkg.packageJson.version}) from ${packagePath}`,
		// 	);
		// }
	}

	public static isSame(a: Workspace | undefined, b: Workspace | undefined) {
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
		return this.pkg.packageJson.fluidBuild;
	}

	public getNodeModulePath() {
		return path.join(this.repoPath, "node_modules");
	}

	public async install() {
		this.logger.log(`Release group ${this.name}: Installing - ${this.installCommand}`);
		return execWithErrorAsync(this.installCommand, { cwd: this.repoPath }, this.repoPath);
	}
	public async uninstall() {
		return rimrafWithErrorAsync(this.getNodeModulePath(), this.repoPath);
	}
}
