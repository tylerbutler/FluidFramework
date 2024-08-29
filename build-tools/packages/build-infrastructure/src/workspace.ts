/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import path from "node:path";
import { getPackagesSync } from "@manypkg/get-packages";

import type { ReleaseGroupDefinition, WorkspaceDefinition } from "./config.js";
import type {
	IPackage,
	IReleaseGroup,
	IWorkspace,
	PackageManager,
	ReleaseGroupName,
	WorkspaceName,
} from "./interfaces.js";
import { loadPackage } from "./package.js";
import { ReleaseGroup } from "./releaseGroup.js";

export class Workspace implements IWorkspace {
	public readonly name: WorkspaceName;
	public readonly releaseGroups: Map<ReleaseGroupName, IReleaseGroup>;
	private constructor(
		name: string,
		public readonly directory: string,
		public readonly rootPackage: IPackage,
		public readonly packages: IPackage[],
		// public readonly releaseGroups: Map<ReleaseGroupName, IReleaseGroup>,
		// releaseGroupDefinition: Record<string, string>
		definition: WorkspaceDefinition,
	) {
		this.name = name as WorkspaceName;
		const rGroupDefinitions: Map<ReleaseGroupName, ReleaseGroupDefinition> =
			definition.releaseGroups === undefined
				? new Map()
				: new Map(
						Object.entries(definition.releaseGroups).map((entry) => {
							const [name, group] = entry;
							return [name as ReleaseGroupName, group];
						}),
					);

		this.releaseGroups = new Map();
		for (const [groupName, def] of rGroupDefinitions) {
			this.releaseGroups.set(groupName, new ReleaseGroup(groupName, def, packages));
		}

		// sanity check - make sure that all packages are in a release group.
		const noGroup = new Set(packages.map((p) => p.name));
		for (const group of this.releaseGroups.values()) {
			for (const pkg of group.packages) {
				noGroup.delete(pkg.name);
			}
		}

		if (noGroup.size > 0) {
			const packageList = [...noGroup].join("\n");
			const message = `Found packages in the ${name} workspace that are not in any release groups. Check your config.\n${packageList}`;
			throw new Error(message);
		}
	}

	public static load(
		name: string,
		definition: WorkspaceDefinition,
		repoRoot: string,
	): IWorkspace {
		const absDirectory = path.resolve(repoRoot, definition.directory);

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

		// Load IPackages for all packages in the workspace except the root
		const packages = filtered.map((pkg) =>
			loadPackage(
				path.join(pkg.dir, "package.json"),
				packageManager,
				// /* isWorkspaceRoot */ false,
				// /* isReleaseGroupRoot */ false,
			),
		);

		// Load the workspace root IPackage
		const rootPackage = loadPackage(
			path.join(foundRootPackage.dir, "package.json"),
			packageManager,
			/* isWorkspaceRoot */ true,
			/* isReleaseGroupRoot */ false,
		);

		// const m = definition.releaseGroups === undefined ? new Map() : new Map(Object.entries(definition.releaseGroups).map(([a, b])=> {
		// 	return [a as ReleaseGroupName, ]
		// })

		const workspace = new Workspace(name, absDirectory, rootPackage, packages, definition);
		return workspace;
	}
}

// type PackageKinds = "WorkspaceRoot" | "ReleaseGroupMember" | "ReleaseGroupRoot";
