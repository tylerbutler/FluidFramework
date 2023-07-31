/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { PackageName } from "@rushstack/node-core-library";
import chalk from "chalk";
import detectIndent from "detect-indent";
import { readFileSync, readJsonSync, writeJsonSync } from "fs-extra";
import isEqual from "lodash.isequal";
import { existsSync, lstatSync, readdirSync } from "node:fs";
import path from "node:path";
import sortPackageJson from "sort-package-json";
// eslint-disable-next-line node/no-missing-import
import type { PackageJson as StandardPackageJson, SetRequired } from "type-fest";

import { Logger } from "./logging";
import { ReleaseGroup } from "./monorepo";
import { IFluidBuildConfig, ITypeValidationConfig, lookUpDirSync } from "./fluidRepo";
import { execWithErrorAsync } from "./exec";

export type PackageManager = "npm" | "pnpm" | "yarn";

/**
 * A type representing fluid-build-specific config that may be in package.json.
 */
interface FluidPackageJson {
	/**
	 * nyc config
	 */
	nyc?: any;

	/**
	 * type compatibility test configuration. This only takes effect when set in the package.json of a package. Setting
	 * it at the root of the repo or release group has no effect.
	 */
	typeValidation?: ITypeValidationConfig;

	/**
	 * fluid-build config. Some properties only apply when set in the root or release group root package.json.
	 */
	fluidBuild?: IFluidBuildConfig;
}

/**
 * A type representing all known fields in package.json, including fluid-build-specific config.
 *
 * By default all fields are optional, but we require that the name, dependencies, devDependencies, scripts, and version
 * all be defined.
 */
export type PackageJson = SetRequired<
	StandardPackageJson & FluidPackageJson,
	"name" | "dependencies" | "devDependencies" | "scripts" | "version"
>;

export class Package {
	private static packageCount: number = 0;
	private static readonly chalkColor = [
		chalk.red,
		chalk.green,
		chalk.yellow,
		chalk.blue,
		chalk.magenta,
		chalk.cyan,
		chalk.white,
		chalk.grey,
		chalk.redBright,
		chalk.greenBright,
		chalk.yellowBright,
		chalk.blueBright,
		chalk.magentaBright,
		chalk.cyanBright,
		chalk.whiteBright,
	];

	private _packageJson: PackageJson;
	private readonly packageId = Package.packageCount++;
	private _matched: boolean = false;

	private readonly _indent: string;
	public readonly packageManager: PackageManager;
	public get packageJson(): PackageJson {
		return this._packageJson;
	}

	/**
	 * Create a new package from a package.json file. Prefer the .load method to calling the contructor directly.
	 *
	 * @param packageJsonFileName - The path to a package.json file.
	 * @param group - A group that this package is a part of.
	 * @param monoRepo - Set this if the package is part of a release group (monorepo).
	 * @param additionalProperties - An object with additional properties that should be added to the class. This is
	 * useful to augment the package class with additional properties.
	 */
	constructor(
		public readonly packageJsonFileName: string,
		public readonly group: string,
		public readonly monoRepo?: ReleaseGroup,
		private readonly log?: Logger,
		additionalProperties: any = {},
	) {
		[this._packageJson, this._indent] = readPackageJsonAndIndent(packageJsonFileName);
		const pnpmWorkspacePath = path.join(this.directory, "pnpm-workspace.yaml");
		const yarnLockPath = path.join(this.directory, "yarn.lock");
		this.packageManager = existsSync(pnpmWorkspacePath)
			? "pnpm"
			: existsSync(yarnLockPath)
			? "yarn"
			: "npm";
		log?.verbose(`Package loaded: ${this.nameColored}`);
		Object.assign(this, additionalProperties);
	}

	/**
	 * The name of the package including the scope.
	 */
	public get name(): string {
		return this.packageJson.name;
	}

	/**
	 * The name of the package with a color for terminal output.
	 */
	public get nameColored(): string {
		return this.color(this.name);
	}

	/**
	 * The name of the package excluding the scope.
	 */
	public get nameUnscoped(): string {
		return PackageName.getUnscopedName(this.name);
	}

	/**
	 * The parsed package scope, including the \@-sign, or an empty string if there is no scope.
	 */
	public get scope(): string {
		return PackageName.getScope(this.name);
	}

	public get private(): boolean {
		return this.packageJson.private ?? false;
	}

	public get version(): string {
		return this.packageJson.version;
	}

	public get isPublished(): boolean {
		return !this.private;
	}

	public get isTestPackage(): boolean {
		return this.name.split("/")[1]?.startsWith("test-") === true;
	}

	public get matched() {
		return this._matched;
	}

	public setMatched() {
		this._matched = true;
	}

	public get dependencies() {
		return Object.keys(this.packageJson.dependencies ?? {});
	}

	public get combinedDependencies(): Generator<
		{
			name: string;
			version: string;
			dev: boolean;
		},
		void
	> {
		// eslint-disable-next-line unicorn/consistent-function-scoping
		const it = function* (packageJson: PackageJson) {
			// eslint-disable-next-line guard-for-in, no-restricted-syntax
			for (const item in packageJson.dependencies) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				yield { name: item, version: packageJson.dependencies[item]!, dev: false };
			}
			// eslint-disable-next-line guard-for-in, no-restricted-syntax
			for (const item in packageJson.devDependencies) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				yield { name: item, version: packageJson.devDependencies[item]!, dev: true };
			}
		};
		return it(this.packageJson);
	}

	public get directory(): string {
		return path.dirname(this.packageJsonFileName);
	}

	/**
	 * Get the full path for the lock file.
	 * @returns full path for the lock file, or undefined if one doesn't exist
	 */
	public getLockFilePath() {
		const directory = this.monoRepo ? this.monoRepo.repoPath : this.directory;
		const lockFileNames = ["pnpm-lock.yaml", "yarn.lock", "package-lock.json"];
		for (const lockFileName of lockFileNames) {
			const full = path.join(directory, lockFileName);
			if (existsSync(full)) {
				return full;
			}
		}
	}

	public get installCommand(): string {
		return this.packageManager === "pnpm"
			? "pnpm i"
			: this.packageManager === "yarn"
			? "npm run install-strict"
			: "npm i";
	}

	private get color() {
		return Package.chalkColor[this.packageId % Package.chalkColor.length];
	}

	public getScript(name: string): string | undefined {
		return this.packageJson.scripts === undefined ? undefined : this.packageJson.scripts[name];
	}

	// public async cleanNodeModules() {
	// 	return rimrafWithErrorAsync(path.join(this.directory, "node_modules"), this.nameColored);
	// }

	public async savePackageJson() {
		writePackageJson(this.packageJsonFileName, this.packageJson, this._indent);
	}

	public reload() {
		this._packageJson = readJsonSync(this.packageJsonFileName);
	}

	// public async noHoistInstall(repoRoot: string) {
	// 	// Fluid specific
	// 	const rootNpmRC = path.join(repoRoot, ".npmrc");
	// 	const npmRC = path.join(this.directory, ".npmrc");

	// 	await copyFileAsync(rootNpmRC, npmRC);
	// 	const result = await execWithErrorAsync(
	// 		`${this.installCommand} --no-package-lock --no-shrinkwrap`,
	// 		{ cwd: this.directory },
	// 		this.nameColored,
	// 	);
	// 	await unlinkAsync(npmRC);

	// 	return result;
	// }

	public async checkInstall(print: boolean = true) {
		if (this.combinedDependencies.next().done === true) {
			// No dependencies
			return true;
		}

		if (!existsSync(path.join(this.directory, "node_modules"))) {
			if (print) {
				this.log?.errorLog(`${this.nameColored}: node_modules not installed`);
			}
			return false;
		}
		let succeeded = true;
		for (const dep of this.combinedDependencies) {
			if (
				lookUpDirSync(this.directory, (currentDir) => {
					// TODO: check semver as well
					return existsSync(path.join(currentDir, "node_modules", dep.name)) === true;
				}) !== undefined
			) {
				succeeded = false;
				if (print) {
					this.log?.errorLog(`${this.nameColored}: dependency ${dep.name} not found`);
				}
			}
		}
		return succeeded;
	}

	public async install() {
		if (this.monoRepo) {
			throw new Error("Package in a monorepo shouldn't be installed");
		}

		this.log?.log(`${this.nameColored}: Installing - ${this.installCommand}`);
		return execWithErrorAsync(this.installCommand, { cwd: this.directory }, this.directory);
	}

	/**
	 * Load a package from a package.json file. Prefer this to calling the contructor directly.
	 *
	 * @param packageJsonFileName - The path to a package.json file.
	 * @param group - A group that this package is a part of.
	 * @param monoRepo - Set this if the package is part of a release group (monorepo).
	 * @param additionalProperties - An object with additional properties that should be added to the class. This is
	 * useful to augment the package class with additional properties.
	 */
	public static load<T extends typeof Package, TAddProps>(
		this: T,
		packageJsonFileName: string,
		group: string,
		monoRepo?: ReleaseGroup,
		log?: Logger,
		additionalProperties?: TAddProps,
	) {
		return new this(
			packageJsonFileName,
			group,
			monoRepo,
			log,
			additionalProperties,
		) as InstanceType<T> & TAddProps;
	}

	/**
	 * Load a package from directory containing a package.json.
	 *
	 * @param packageDir - The path to a package.json file.
	 * @param group - A group that this package is a part of.
	 * @param monoRepo - Set this if the package is part of a release group (monorepo).
	 * @param additionalProperties - An object with additional properties that should be added to the class. This is
	 * useful to augment the package class with additional properties.
	 * @typeParam TAddProps - The type of the additional properties object.
	 * @returns a loaded Package. If additional properties are specifed, the returned type will be Package & TAddProps.
	 */
	public static loadDir<T extends typeof Package, TAddProps>(
		this: T,
		packageDir: string,
		group: string,
		monoRepo?: ReleaseGroup,
		log?: Logger,
		additionalProperties?: TAddProps,
	) {
		return Package.load(
			path.join(packageDir, "package.json"),
			group,
			monoRepo,
			log,
			additionalProperties,
		) as InstanceType<T> & TAddProps;
	}
}

export class Packages {
	// eslint-disable-next-line no-useless-constructor
	public constructor(public readonly packages: Package[]) {}

	public static loadDir(
		dirFullPath: string,
		group: string,
		ignoredDirFullPaths: string[] | undefined,
		monoRepo?: ReleaseGroup,
	) {
		const packageJsonFileName = path.join(dirFullPath, "package.json");
		if (existsSync(packageJsonFileName)) {
			return [Package.load(packageJsonFileName, group, monoRepo)];
		}

		const packages: Package[] = [];
		const files = readdirSync(dirFullPath, { withFileTypes: true });
		for (const dirent of files) {
			if (dirent.isDirectory() && dirent.name !== "node_modules") {
				const fullPath = path.join(dirFullPath, dirent.name);
				if (
					ignoredDirFullPaths === undefined ||
					!ignoredDirFullPaths.some((name) => isSameFileOrDir(name, fullPath))
				) {
					packages.push(
						...Packages.loadDir(fullPath, group, ignoredDirFullPaths, monoRepo),
					);
				}
			}
		}
		return packages;
	}

	// public async cleanNodeModules() {
	// 	return this.queueExecOnAllPackage((pkg) => pkg.cleanNodeModules(), "rimraf node_modules");
	// }

	// public async noHoistInstall(repoRoot: string) {
	// 	return this.queueExecOnAllPackage(
	// 		(pkg) => pkg.noHoistInstall(repoRoot),
	// 		"install dependencies",
	// 	);
	// }

	public async filterPackages(releaseGroup: string | undefined) {
		if (releaseGroup === undefined) {
			return this.packages;
		}
		return this.packages.filter((p) => p.monoRepo?.kind === releaseGroup);
	}

	// public async forEachAsync<TResult>(
	// 	exec: (pkg: Package) => Promise<TResult>,
	// 	parallel: boolean,
	// 	message?: string,
	// ) {
	// 	if (parallel) {
	// 		return this.queueExecOnAllPackageCore(exec, message);
	// 	}

	// 	const results: TResult[] = [];
	// 	for (const pkg of this.packages) {
	// 		results.push(await exec(pkg));
	// 	}
	// 	return results;
	// }

	// public static async clean(packages: Package[], status: boolean) {
	// 	const cleanP: Promise<ExecAsyncResult>[] = [];
	// 	let numDone = 0;
	// 	const execCleanScript = async (pkg: Package, cleanScript: string) => {
	// 		const startTime = Date.now();
	// 		const result = await execWithErrorAsync(
	// 			cleanScript,
	// 			{
	// 				cwd: pkg.directory,
	// 				env: {
	// 					PATH: `${process.env["PATH"]}${path.delimiter}${path.join(
	// 						pkg.directory,
	// 						"node_modules",
	// 						".bin",
	// 					)}`,
	// 				},
	// 			},
	// 			pkg.nameColored,
	// 		);

	// 		if (status) {
	// 			const elapsedTime = (Date.now() - startTime) / 1000;
	// 			log(
	// 				`[${++numDone}/${cleanP.length}] ${
	// 					pkg.nameColored
	// 				}: ${cleanScript} - ${elapsedTime.toFixed(3)}s`,
	// 			);
	// 		}
	// 		return result;
	// 	};
	// 	for (const pkg of packages) {
	// 		const cleanScript = pkg.getScript("clean");
	// 		if (cleanScript) {
	// 			cleanP.push(execCleanScript(pkg, cleanScript));
	// 		}
	// 	}
	// 	const results = await Promise.all(cleanP);
	// 	return !results.some((result) => result.error);
	// }

	// private async queueExecOnAllPackageCore<TResult>(
	// 	exec: (pkg: Package) => Promise<TResult>,
	// 	message?: string,
	// ) {
	// 	const messageCallback = message
	// 		? (pkg: Package) => ` ${pkg.nameColored}: ${message}`
	// 		: undefined;
	// 	return queueExec(this.packages, exec, messageCallback);
	// }

	// private async queueExecOnAllPackage(
	// 	exec: (pkg: Package) => Promise<ExecAsyncResult>,
	// 	message?: string,
	// ) {
	// 	const results = await this.queueExecOnAllPackageCore(exec, message);
	// 	return !results.some((result) => result.error);
	// }
}

/**
 * Reads the contents of package.json, applies a transform function to it, then writes the results back to the source
 * file.
 *
 * @param packagePath - A path to a package.json file or a folder containing one. If the path is a directory, the
 * package.json from that directory will be used.
 * @param packageTransformer - A function that will be executed on the package.json contents before writing it
 * back to the file.
 *
 * @remarks
 *
 * The package.json is always sorted using sort-package-json.
 *
 * @internal
 */
export function updatePackageJsonFile(
	packagePath: string,
	packageTransformer: (json: PackageJson) => void,
): void {
	// eslint-disable-next-line no-param-reassign
	packagePath = packagePath.endsWith("package.json")
		? packagePath
		: path.join(packagePath, "package.json");
	const [pkgJson, indent] = readPackageJsonAndIndent(packagePath);

	// Transform the package.json
	packageTransformer(pkgJson);

	writePackageJson(packagePath, pkgJson, indent);
}

/**
 * Reads a package.json file from a path, detects its indentation, and returns both the JSON as an object and
 * indentation.
 *
 * @internal
 */
export function readPackageJsonAndIndent(pathToJson: string): [json: PackageJson, indent: string] {
	const contents = readFileSync(pathToJson).toString();
	const indentation = detectIndent(contents).indent || "\t";
	const pkgJson: PackageJson = JSON.parse(contents);
	return [pkgJson, indentation];
}

/**
 * Writes a PackageJson object to a file using the provided indentation.
 */
function writePackageJson(packagePath: string, pkgJson: PackageJson, indent: string) {
	return writeJsonSync(packagePath, sortPackageJson(pkgJson), { spaces: indent });
}

function isSameFileOrDir(f1: string, f2: string) {
	if (f1 === f2) {
		return true;
	}
	const n1 = path.normalize(f1);
	const n2 = path.normalize(f2);
	if (n1 === n2) {
		return true;
	}
	if (n1.toLowerCase() !== n2.toLowerCase()) {
		return false;
	}
	return isEqual(lstatSync(n1), lstatSync(n2));
}
