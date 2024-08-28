/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import path from "node:path";
import chalk from "chalk";
import { readJsonSync } from "fs-extra/esm";

import type {
	AdditionalPackageProps,
	IPackage,
	PackageJson,
	PackageManager,
	PackageName,
} from "./interfaces.js";
import { readPackageJsonAndIndent, writePackageJson } from "./packageJsonUtils.js";

export class Package<
	TAddProps extends AdditionalPackageProps = undefined,
	J extends PackageJson = PackageJson,
> implements IPackage
{
	private static packageCount: number = 0;
	private static readonly chalkColor = [
		chalk.default.red,
		chalk.default.green,
		chalk.default.yellow,
		chalk.default.blue,
		chalk.default.magenta,
		chalk.default.cyan,
		chalk.default.white,
		chalk.default.grey,
		chalk.default.redBright,
		chalk.default.greenBright,
		chalk.default.yellowBright,
		chalk.default.blueBright,
		chalk.default.magentaBright,
		chalk.default.cyanBright,
		chalk.default.whiteBright,
	];

	private readonly _indent: string;
	private _packageJson: J;
	private readonly packageId = Package.packageCount++;

	/**
	 * Create a new package from a package.json file. Prefer the .load method to calling the contructor directly.
	 *
	 * @param packageJsonFilePath - The path to a package.json file.
	 * @param packageManager - The package manager used by the workspace.
	 * @param isWorkspaceRoot - Set to true if this package is the root of a workspace.
	 * @param additionalProperties - An object with additional properties that should be added to the class. This is
	 * useful to augment the package class with additional properties.
	 */
	public constructor(
		public readonly packageJsonFilePath: string,
		public readonly packageManager: PackageManager,
		// public readonly workspace?: IWorkspace,
		public readonly isWorkspaceRoot: boolean = false,
		additionalProperties?: TAddProps,
	) {
		[this._packageJson, this._indent] = readPackageJsonAndIndent(packageJsonFilePath);
		// this.reload();
		if (additionalProperties !== undefined) {
			Object.assign(this, additionalProperties);
		}
	}

	/**
	 * The name of the package including the scope.
	 */
	public get name(): PackageName {
		return this.packageJson.name as PackageName;
	}

	/**
	 * The name of the package with a color for terminal output.
	 */
	public get nameColored(): string {
		return this.color(this.name);
	}

	public get packageJson(): J {
		return this._packageJson;
	}

	public get private(): boolean {
		return this.packageJson.private ?? false;
	}

	public get version(): string {
		return this.packageJson.version;
	}

	// public get isPublished(): boolean {
	// 	return !this.private;
	// }

	// public get isTestPackage(): boolean {
	// 	return this.name.split("/")[1]?.startsWith("test-") === true;
	// }

	/**
	 * Returns true if the package is a release group root package based on its directory path.
	 */
	// public get isReleaseGroupRoot(): boolean {
	// 	return this.monoRepo !== undefined && this.directory === this.monoRepo.repoPath;
	// }

	// public get matched() {
	// 	return this._matched;
	// }

	// public setMatched() {
	// 	this._matched = true;
	// }

	// public get dependencies() {
	// 	return Object.keys(this.packageJson.dependencies ?? {});
	// }

	// public get combinedDependencies(): Generator<PackageDependency, void> {
	// 	const it = function* (packageJson: PackageJson) {
	// 		for (const item in packageJson.dependencies) {
	// 			yield {
	// 				name: item,
	// 				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	// 				version: packageJson.dependencies[item]!,
	// 				depClass: "prod",
	// 			} as const;
	// 		}
	// 		for (const item in packageJson.devDependencies) {
	// 			yield {
	// 				name: item,
	// 				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	// 				version: packageJson.devDependencies[item]!,
	// 				depClass: "dev",
	// 			} as const;
	// 		}
	// 		for (const item in packageJson.peerDependencies) {
	// 			yield {
	// 				name: item,
	// 				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	// 				version: packageJson.peerDependencies[item]!,
	// 				depClass: "peer",
	// 			} as const;
	// 		}
	// 	};
	// 	return it(this.packageJson);
	// }

	public get directory(): string {
		return path.dirname(this.packageJsonFilePath);
	}

	/**
	 * Get the full path for the lock file.
	 * @returns full path for the lock file, or undefined if one doesn't exist
	 */
	// public getLockFilePath() {
	// 	const directory = this.monoRepo ? this.monoRepo.repoPath : this.directory;
	// 	const lockFileNames = ["pnpm-lock.yaml", "yarn.lock", "package-lock.json"];
	// 	for (const lockFileName of lockFileNames) {
	// 		const full = path.join(directory, lockFileName);
	// 		if (fs.existsSync(full)) {
	// 			return full;
	// 		}
	// 	}
	// 	return undefined;
	// }

	// public get installCommand(): string {
	// 	return this.packageManager === "pnpm"
	// 		? "pnpm install --no-"
	// 		: this.packageManager === "yarn"
	// 			? "npm run install-strict"
	// 			: "npm i";
	// }

	private get color() {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return Package.chalkColor[this.packageId % Package.chalkColor.length]!;
	}

	public getScript(name: string): string | undefined {
		return this.packageJson.scripts ? this.packageJson.scripts[name] : undefined;
	}

	// public async cleanNodeModules() {
	// 	return rimrafWithErrorAsync(path.join(this.directory, "node_modules"), this.nameColored);
	// }

	public async savePackageJson() {
		writePackageJson(this.packageJsonFilePath, this.packageJson, this._indent);
	}

	public reload() {
		this._packageJson = readJsonSync(this.packageJsonFilePath);
	}

	// public async checkInstall(print: boolean = true) {
	// 	if (this.combinedDependencies.next().done) {
	// 		// No dependencies
	// 		return true;
	// 	}

	// 	if (!existsSync(path.join(this.directory, "node_modules"))) {
	// 		if (print) {
	// 			error(`${this.nameColored}: node_modules not installed in ${this.directory}`);
	// 		}
	// 		return false;
	// 	}
	// 	let succeeded = true;
	// 	for (const dep of this.combinedDependencies) {
	// 		if (
	// 			!lookUpDirSync(this.directory, (currentDir) => {
	// 				// TODO: check semver as well
	// 				return existsSync(path.join(currentDir, "node_modules", dep.name));
	// 			})
	// 		) {
	// 			succeeded = false;
	// 			if (print) {
	// 				error(`${this.nameColored}: dependency ${dep.name} not found`);
	// 			}
	// 		}
	// 	}
	// 	return succeeded;
	// }

	// public async install() {
	// 	if (this.monoRepo) {
	// 		throw new Error("Package in a monorepo shouldn't be installed");
	// 	}

	// 	log(`${this.nameColored}: Installing - ${this.installCommand}`);
	// 	return execWithErrorAsync(this.installCommand, { cwd: this.directory }, this.directory);
	// }

	/**
	 * Load a package from a package.json file. Prefer this to calling the contructor directly.
	 *
	 * @param packageJsonFileName - The path to a package.json file.
	 * @param group - A group that this package is a part of.
	 * @param monoRepo - Set this if the package is part of a release group (monorepo).
	 * @param additionalProperties - An object with additional properties that should be added to the class. This is
	 * useful to augment the package class with additional properties.
	 */
	public static load<
		T extends typeof Package,
		TAddProps extends AdditionalPackageProps = undefined,
	>(
		this: T,
		packageJsonFilePath: string,
		packageManager: PackageManager,
		// workspace?: IWorkspace,
		isWorkspaceRoot: boolean = false,
		additionalProperties?: TAddProps,
	) {
		return new this(
			packageJsonFilePath,
			packageManager,
			// workspace,
			isWorkspaceRoot,
			additionalProperties,
		) as InstanceType<T> & TAddProps;
	}

	// /**
	//  * Load a package from directory containing a package.json.
	//  *
	//  * @param packageDir - The path to a package.json file.
	//  * @param group - A group that this package is a part of.
	//  * @param monoRepo - Set this if the package is part of a release group (monorepo).
	//  * @param additionalProperties - An object with additional properties that should be added to the class. This is
	//  * useful to augment the package class with additional properties.
	//  * @typeParam TAddProps - The type of the additional properties object.
	//  * @returns a loaded Package. If additional properties are specifed, the returned type will be Package & TAddProps.
	//  */
	// public static loadDir<T extends typeof Package, TAddProps>(
	// 	this: T,
	// 	packageDir: string,
	// 	group: string,
	// 	monoRepo?: MonoRepo,
	// 	additionalProperties?: TAddProps,
	// ) {
	// 	return Package.load(
	// 		path.join(packageDir, "package.json"),
	// 		group,
	// 		monoRepo,
	// 		additionalProperties,
	// 	) as InstanceType<T> & TAddProps;
	// }
}

export function loadPackage(
	packageJsonFilePath: string,
	packageManager: PackageManager,
	isWorkspaceRoot: boolean = false,
): IPackage {
	const pkg = Package.load(packageJsonFilePath, packageManager, isWorkspaceRoot, undefined);
	return pkg;
}
