import path from "node:path";
import type { WorkspaceDefinition } from "./config";
import type { IPackage, IWorkspace, PackageManager, WorkspaceName } from "./interfaces";
import { getPackagesSync } from "@manypkg/get-packages";

export class Workspace implements IWorkspace {
	public readonly name: WorkspaceName;
	private constructor(
		name: string,
		public readonly directory: string,
		public readonly rootPackage: IPackage,
		public readonly packages: IPackage[],
		// definition: WorkspaceDefinition,
	) {
		this.name = name as WorkspaceName;
	}

	public get releaseGroups() {
		// TODO: implement
		return new Map();
	}

	public static load(
		name: string,
		{ directory, releaseGroups }: WorkspaceDefinition,
	): IWorkspace {
		const absDirectory = path.resolve(directory);

		let packageManager: PackageManager;
		let packageDirs: string[];

		const { tool, packages, rootPackage, foundRoot } = getPackagesSync(absDirectory);
		if (foundRoot !== absDirectory) {
			// This is a sanity check. directory is the path passed in when creating the Workspace object, while rootDir is
			// the dir that manypkg found. They should be the same.
			throw new Error(
				`The root dir found by manypkg, '${foundRoot}', does not match the configured directory '${directory}'`,
			);
		}

		if (rootPackage === undefined) {
			throw new Error(`No root package found for workspace in ${foundRoot}`);
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
		// if (packages.length === 1 && packages[0]?.dir === directory) {
		// 	// this is a independent package
		// 	return undefined;
		// }

		packageDirs = packages.filter((pkg) => pkg.relativeDir !== ".").map((pkg) => pkg.dir);
	}
}
