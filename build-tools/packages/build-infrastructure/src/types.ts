/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { SimpleGit } from "simple-git";
import type { Opaque, SetRequired, PackageJson as StandardPackageJson } from "type-fest";

/**
 * A type representing fluid-build-specific config that may be in package.json.
 */
export interface FluidPackageJsonFields {
	/**
	 * pnpm config
	 */
	pnpm?: {
		overrides?: Record<string, string>;
	};
}

export type PackageJson = SetRequired<
	StandardPackageJson & FluidPackageJsonFields,
	"name" | "scripts" | "version"
>;

export type AdditionalPackageProps = Record<string, string> | undefined;

/**
 * A Fluid repo organizes a collection of npm packages into workspaces and release groups. A Fluid repo can contain
 * multiple workspaces, and a workspace can in turn contain multiple release groups. Both workspaces and release groups
 * represent ways to organize packages in the repo, but their purpose and function are different.
 *
 * See {@link IWorkspace} and {@link IReleaseGroup} for more details.
 */
export interface IFluidRepo extends Reloadable {
	/**
	 * The absolute path to the root of the IFluidRepo. This is the path where the config file is located.
	 */
	root: string;

	/**
	 * A map of all workspaces in the Fluid repo.
	 */
	workspaces: Map<WorkspaceName, IWorkspace>;

	/**
	 * A map of all release groups in the Fluid repo.
	 */
	releaseGroups: Map<ReleaseGroupName, IReleaseGroup>;

	/**
	 * A map of all packages in the Fluid repo.
	 */
	packages: Map<PackageName, IPackage>;

	/**
	 * A partial URL to the upstream (remote) repo. This can be set to the name of the repo on GitHub. For example,
	 * "microsoft/FluidFramework".
	 */
	upstreamRemotePartialUrl?: string;

	/**
	 * Transforms an absolute path to a path relative to the FluidRepo root.
	 *
	 * @param p - The path to make relative to the FluidRepo root.
	 * @returns the relative path.
	 */
	relativeToRepo(p: string): string;

	/**
	 * If the FluidRepo is within a Git repository, this function will return a SimpleGit instance rooted at the root of
	 * the Git repository. If the FluidRepo is _not_ within a Git repository, this function will throw a
	 * {@link NotInGitRepository} error.
	 *
	 * @throws A {@link NotInGitRepository} error if the path is not within a Git repository.
	 */
	getGitRepository(): Promise<Readonly<SimpleGit>>;

	/**
	 * Returns the {@link IReleaseGroup} associated with a package.
	 */
	getPackageReleaseGroup(pkg: Readonly<IPackage>): Readonly<IReleaseGroup>;

	/**
	 * Returns the {@link IWorkspace} associated with a package.
	 */
	getPackageWorkspace(pkg: Readonly<IPackage>): Readonly<IWorkspace>;
}

/**
 * A common interface for installable things, like packages, release groups, and workspaces.
 */
export interface Installable {
	/**
	 * Returns `true` if the item is installed. If this returns `false`, then the `install` function can be called to
	 * install.
	 */
	checkInstall(): Promise<boolean>;

	/**
	 * Installs the item.
	 *
	 * @param updateLockfile - If true, the lockfile will be updated. Otherwise, the lockfile will not be updated. This
	 * may cause the installation to fail.
	 */
	install(updateLockfile: boolean): Promise<boolean>;
}

/**
 * An interface for things that can be reloaded,
 */
export interface Reloadable {
	reload(): void;
}

/**
 * A tagged type representing workspace names.
 */
export type WorkspaceName = Opaque<string, "WorkspaceName">;

/**
 * A workspace is a collection of packages, including a root package, that is managed using a package manager's
 * "workspaces" functionality. A Fluid repo can contain multiple workspaces. Workspaces are defined and managed using
 * the package manager directly. A Fluid repo builds on top of workspaces and relies on the package manager to install
 * and manage dependencies and interdependencies within the workspace.
 *
 * A workspace defines the _physical layout_ of the packages within it. Workspaces are a generally a feature provided by
 * the package manager (npm, yarn, pnpm, etc.). A workspace is rooted in a particular folder, and uses the configuration
 * within that folder to determine what packages it contains. The configuration used is specific to the package manager.
 *
 * The workspace is also the boundary at which dependencies are installed and managed. When you install dependencies for
 * a package in a workspace, all dependencies for all packages in the workspace will be installed. Within a workspace,
 * it is trivial to link multiple packages so they can depend on one another. The `IWorkspace` type is a thin wrapper on
 * top of these package manager features.
 *
 * A Fluid repo will only load packages identified by the package manager's workspace feature. That is, any package in
 * the repo that is not configured as part of a workspace is invisible to tools using the Fluid repo.
 *
 * Workspaces are not involved in versioning or releasing packages. They are used for dependency management only.
 * Release groups, on the other hand, are used to group packages into releasable groups. See {@link IReleaseGroup} for
 * more information.
 */
export interface IWorkspace extends Installable, Reloadable {
	/**
	 * The name of the workspace.
	 */
	name: WorkspaceName;

	/**
	 * The root directory of the workspace. This directory will contain the workspace root package.
	 */
	directory: string;

	/**
	 * The root package of the workspace.
	 */
	rootPackage: IPackage;

	/**
	 * A map of all the release groups in the workspace.
	 */
	releaseGroups: Map<ReleaseGroupName, IReleaseGroup>;

	/**
	 * An array of all the packages in the workspace. This includes the workspace root and any release group roots and
	 * constituent packages as well.
	 */
	packages: IPackage[];
	toString(): string;
}

/**
 * A tagged type representing release group names.
 */
export type ReleaseGroupName = Opaque<string, IReleaseGroup>;

/**
 * A release group is a collection of packages that are versioned and released together. All packages within a release
 * group will have the same version, and all packages will be released at the same time.
 *
 * Release groups are not involved in dependency management. They are used for versioning and releasing packages only.
 * Workspaces, on the other hand, are used to manage dependencies and interdependencies. See {@link IWorkspace} for more
 * information.
 */
export interface IReleaseGroup extends Reloadable {
	/**
	 * The name of the release group. All release groups must have unique names.
	 */
	readonly name: ReleaseGroupName;

	/**
	 * The version of the release group.
	 */
	readonly version: string;

	/**
	 * The package that is the release group root, if one exists.
	 */
	readonly rootPackage?: IPackage;

	/**
	 * An array of all packages in the release group.
	 */
	readonly packages: IPackage[];

	/**
	 * The workspace that the release group belongs to.
	 */
	readonly workspace: IWorkspace;

	/**
	 * An optional ADO pipeline URL for the CI pipeline that builds the release group.
	 */
	readonly adoPipelineUrl?: string;

	toString(): string;
}

/**
 * A type guard that returns `true` if the checked item is an {@link IReleaseGroup}.
 */
export function isIReleaseGroup(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toCheck: Exclude<any, string | number | ReleaseGroupName | PackageName>,
): toCheck is IReleaseGroup {
	if (!("name" in toCheck)) {
		return false;
	}

	if (typeof toCheck === "object") {
		// TODO: is there a better way to implement a type guard than unique names of properties? Maybe something with the
		// opaque types?
		return "workspace" in toCheck && "packages" in toCheck;
	}

	return false;
}

/**
 * Known package managers supported by build-infrastructure.
 */
export type PackageManagerName = "npm" | "pnpm" | "yarn";

/**
 * A package manager, such as "npm" or "pnpm".
 */
export interface IPackageManager {
	readonly name: PackageManagerName;
	installCommand(updateLockfile: boolean): string;
}

/**
 * Information about a package dependency.
 */
export interface PackageDependency {
	name: PackageName;
	version: string;
	depClass: "prod" | "dev" | "peer";
}

/**
 * A tagged type representing package names.
 */
export type PackageName = Opaque<string, "PackageName">;

/**
 * A common type representing an npm package. A custom type can be used for the package.json schema, which is useful
 * when the package.json has custom keys/values.
 */
export interface IPackage<J extends PackageJson = PackageJson>
	extends Pick<Installable, "checkInstall">,
		Reloadable {
	/**
	 * The name of the package
	 */
	readonly name: PackageName;

	/**
	 * The name of the package color-coded with ANSI color codes for terminal output. The package name will always have
	 * the same color.
	 */
	readonly nameColored: string;

	/**
	 * The absolute path to the directory containing the package (that is, the directory that contains the package.json
	 * for the package).
	 */
	readonly directory: string;

	/**
	 * The package.json contents of the package.
	 */
	packageJson: J;

	/**
	 * The package manager used to manage this package.
	 *
	 * @privateRemarks
	 *
	 * If this is needed at the package level, perhaps it should instead be retrieved from the package's workspace,
	 * since the package manager is defined at the workspace level.
	 */
	readonly packageManager: IPackageManager;

	/**
	 * The version of the package. This is the same as `packageJson.version`.
	 */
	readonly version: string;

	/**
	 * `true` if the package is private; `false` otherwise. This is similar to the field in package.json, but always
	 * returns a boolean value. If the package.json is missing the `private` field, this will return false.
	 */
	readonly private: boolean;

	/**
	 * Whether the package is a workspace root package or not. A workspace will only have one root package.
	 */
	readonly isWorkspaceRoot: boolean;

	/**
	 * The name of the release group that this package belongs to.
	 */
	releaseGroup: ReleaseGroupName;

	/**
	 * Whether the package is a release group root package or not. A release group may not have a root package, but if it
	 * does, it will only have one.
	 */
	isReleaseGroupRoot: boolean;

	/**
	 * The absolute path to the package.json file for this package.
	 */
	readonly packageJsonFilePath: string;

	/**
	 * Returns the value of a script in the package's package.json, or undefined if a script with the provided key is not
	 * found.
	 */
	getScript(name: string): string | undefined;

	/**
	 * Saves any changes to the packageJson property to the package.json file on disk.
	 */
	savePackageJson(): Promise<void>;

	/**
	 * A generator that returns each dependency and the kind of dependency (dev, peer, etc.) for all of the package's
	 * dependencies. This is useful to iterate overall all dependencies of the package.
	 */
	combinedDependencies: Generator<PackageDependency, void>;
	toString(): string;
}

/**
 * A type guard that returns `true` if the item is an {@link IPackage}.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types -- this is a type guard
export function isIPackage(pkg: any): pkg is IPackage {
	if (typeof pkg === "object") {
		return "getScript" in pkg;
	}
	return false;
}