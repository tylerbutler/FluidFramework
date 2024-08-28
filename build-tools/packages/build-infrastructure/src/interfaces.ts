import type { Opaque, PackageJson } from "type-fest";

export type PackageManager = "npm" | "pnpm" | "yarn";

export interface IFluidRepo {
	/**
	 * Absolute path to the root of the repo.
	 */
	root: string;

	workspaces: Map<string, IWorkspace>;

	readonly packageManager: PackageManager;

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

export type PackageName = Opaque<string, "PackageName">;

export interface IPackage<T extends PackageJson = PackageJson> {
	name: PackageName;
	packageJson: T;
	readonly packageManager: PackageManager;
	readonly isWorkspaceRoot: boolean;
	readonly packageJsonFilePath: string;
}
