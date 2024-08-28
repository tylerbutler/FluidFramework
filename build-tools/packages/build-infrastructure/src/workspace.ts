import path from "node:path";
import { getPackagesSync } from "@manypkg/get-packages";

import type { WorkspaceDefinition } from "./config.js";
import type { IPackage, IWorkspace, PackageManager, WorkspaceName } from "./interfaces.js";
import { loadPackage } from "./package.js";

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

	public static load(name: string, { directory }: WorkspaceDefinition): IWorkspace {
		const absDirectory = path.resolve(directory);

		let packageManager: PackageManager;

		const {
			tool,
			packages: foundPackages,
			rootPackage: foundRootPackage,
			rootDir: foundRoot,
		} = getPackagesSync(absDirectory);
		if (foundRoot !== absDirectory) {
			// This is a sanity check. directory is the path passed in when creating the Workspace object, while rootDir is
			// the dir that manypkg found. They should be the same.
			throw new Error(
				`The root dir found by manypkg, '${foundRoot}', does not match the configured directory '${absDirectory}'`,
			);
		}

		if (foundRootPackage === undefined) {
			throw new Error(`No root package found for workspace in '${foundRoot}'`);
		}

		switch (tool.type) {
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

		// filter out the root package
		const filtered = foundPackages.filter((pkg) => pkg.relativeDir !== ".");

		// Absolute paths to all package.jsons for packages in the workspace
		// const packageJsonPaths = filtered.map((pkg)=> pkg.dir);
		const packages = filtered.map((pkg) => loadPackage(pkg.dir, packageManager, false));
		const rootPackage = loadPackage(foundRootPackage.dir, packageManager, true);

		const workspace = new Workspace(name, absDirectory, rootPackage, packages);
		return workspace;
	}
}
