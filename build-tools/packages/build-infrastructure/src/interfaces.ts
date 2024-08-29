/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { Opaque, SetRequired, PackageJson as StandardPackageJson } from "type-fest";

/**
 * A type representing fluid-build-specific config that may be in package.json.
 */
export type FluidPackageJsonFields = {
	/**
	 * pnpm config
	 */
	pnpm?: {
		overrides?: Record<string, string>;
	};
};

export type PackageJson = SetRequired<
	StandardPackageJson & FluidPackageJsonFields,
	"name" | "scripts" | "version"
>;

export type AdditionalPackageProps = Record<string, string> | undefined;

export type PackageManager = "npm" | "pnpm" | "yarn";

export interface IFluidRepo {
	/**
	 * Absolute path to the root of the repo.
	 */
	root: string;

	workspaces: Map<string, IWorkspace>;

	// readonly packageManager: PackageManager;
}

export type WorkspaceName = Opaque<string, "WorkspaceName">;

export interface IWorkspace {
	name: WorkspaceName;
	directory: string;
	rootPackage: IPackage;
	releaseGroups: Map<ReleaseGroupName, IReleaseGroup>;
	packages: IPackage[];
}

export type ReleaseGroupName = Opaque<string, "ReleaseGroupName">;

export interface IReleaseGroup {
	name: ReleaseGroupName;
	packages: IPackage[];
}

/**
 * Information about a package dependency.
 */
export interface PackageDependency {
	name: string;
	version: string;
	depClass: "prod" | "dev" | "peer";
}

export type PackageName = Opaque<string, "PackageName">;

// export interface IPackage<TAddProps extends AdditionalPackageProps = undefined> {
export interface IPackage<J extends PackageJson = PackageJson> {
	readonly name: PackageName;
	readonly nameColored: string;
	readonly directory: string;
	packageJson: J;
	readonly packageManager: PackageManager;
	readonly version: string;
	readonly isWorkspaceRoot: boolean;
	isReleaseGroupRoot: boolean;
	readonly packageJsonFilePath: string;

	getScript(name: string): string | undefined;
	savePackageJson(): Promise<void>;
	reload(): void;

	combinedDependencies: Generator<PackageDependency, void>;
}
