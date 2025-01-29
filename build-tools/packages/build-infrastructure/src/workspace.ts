/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import path from "node:path";

import { installDependencies } from "nypm";
import resolveWorkspacePkg from "resolve-workspace-root";
import { globSync } from "tinyglobby";

const { getWorkspaceGlobs, resolveWorkspaceRoot } = resolveWorkspacePkg;

import type { ReleaseGroupDefinition, WorkspaceDefinition } from "./config.js";
import { loadPackageFromWorkspaceDefinition } from "./package.js";
import { ReleaseGroup } from "./releaseGroup.js";
import type {
	IBuildProject,
	IPackage,
	IReleaseGroup,
	IWorkspace,
	ReleaseGroupName,
	WorkspaceName,
} from "./types.js";

/**
 * {@inheritDoc IWorkspace}
 */
export class Workspace implements IWorkspace {
	/**
	 * {@inheritDoc IWorkspace.name}
	 */
	public readonly name: WorkspaceName;

	/**
	 * {@inheritDoc IWorkspace.releaseGroups}
	 */
	public readonly releaseGroups: Map<ReleaseGroupName, IReleaseGroup>;

	/**
	 * {@inheritDoc IWorkspace.rootPackage}
	 */
	public readonly rootPackage: IPackage;

	/**
	 * {@inheritDoc IWorkspace.packages}
	 */
	public readonly packages: IPackage[];

	/**
	 * {@inheritDoc IWorkspace.directory}
	 */
	public readonly directory: string;

	// private readonly packageManager: IPackageManager;

	/**
	 * Construct a new workspace object.
	 *
	 * @param name - The name of the workspace.
	 * @param definition - The definition of the workspace.
	 * @param root - The path to the root of the workspace.
	 */
	private constructor(
		name: string,
		definition: WorkspaceDefinition,
		root: string,

		/**
		 * {@inheritDoc IWorkspace.buildProject}
		 */
		public readonly buildProject: IBuildProject,
	) {
		this.name = name as WorkspaceName;
		this.directory = path.resolve(root, definition.directory);

		// Find the workspace root
		const foundRoot = resolveWorkspaceRoot(this.directory);
		if (foundRoot === null) {
			throw new Error(
				`Could not find a workspace root. Started looking at '${this.directory}'.`,
			);
		} else if (foundRoot !== this.directory) {
			// This is a sanity check. directory is the path passed in when creating the Workspace object, while rootDir is
			// the dir that `getPackagesSync` found. They should be the same.
			throw new Error(
				`The root dir found by manypkg, '${foundRoot}', does not match the configured directory '${this.directory}'`,
			);
		}

		const workspaceGlobs = getWorkspaceGlobs(foundRoot);
		if (workspaceGlobs === null) {
			throw new Error(`Couldn't find workspace globs.`);
		}

		// detectPackageManager(definition.directory).then((A)=> {

		// })
		// if (foundRootPackage === undefined) {
		// 	throw new Error(`No root package found for workspace in '${foundRoot}'`);
		// }

		// switch (tool.type) {
		// 	case "npm":
		// 	case "pnpm":
		// 	case "yarn": {
		// 		this.packageManager = createPackageManager(tool.type);
		// 		break;
		// 	}
		// 	default: {
		// 		throw new Error(`Unknown package manager '${tool.type}'`);
		// 	}
		// }

		const packageGlobs = workspaceGlobs.map((g) => `${g}/package.json`);
		const packageJsonPaths = globSync(packageGlobs, {
			cwd: foundRoot,
			ignore: ["**/node_modules/**"],
			onlyFiles: true,
			absolute: true,
		});

		this.packages = [];

		// Load all the workspace packages
		for (const pkgJsonPath of packageJsonPaths) {
			const loadedPackage = loadPackageFromWorkspaceDefinition(
				pkgJsonPath,
				/* isWorkspaceRoot */ false,
				definition,
				this,
			);
			this.packages.push(loadedPackage);
		}

		// Load the workspace root IPackage
		this.rootPackage = loadPackageFromWorkspaceDefinition(
			path.join(foundRoot, "package.json"),
			/* isWorkspaceRoot */ true,
			definition,
			this,
		);
		this.packages.unshift(this.rootPackage);

		const rGroupDefinitions: Map<ReleaseGroupName, ReleaseGroupDefinition> =
			definition.releaseGroups === undefined
				? new Map<ReleaseGroupName, ReleaseGroupDefinition>()
				: new Map(
						Object.entries(definition.releaseGroups).map(([rgName, group]) => {
							return [rgName as ReleaseGroupName, group];
						}),
					);

		this.releaseGroups = new Map();
		for (const [groupName, def] of rGroupDefinitions) {
			const newGroup = new ReleaseGroup(groupName, def, this);
			this.releaseGroups.set(groupName, newGroup);
		}

		// sanity check - make sure that all packages are in a release group.
		const noGroup = new Set(this.packages.map((p) => p.name));
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

	/**
	 * {@inheritDoc Installable.checkInstall}
	 */
	public async checkInstall(): Promise<true | string[]> {
		const errors: string[] = [];
		for (const buildPackage of this.packages) {
			const installed = await buildPackage.checkInstall();
			if (installed !== true) {
				errors.push(...installed);
			}
		}

		if (errors.length > 0) {
			return errors;
		}
		return true;
	}

	/**
	 * {@inheritDoc Installable.install}
	 */
	public async install(updateLockfile: boolean): Promise<boolean> {
		try {
			await installDependencies({ cwd: this.directory, frozenLockFile: !updateLockfile });
		} catch {
			return false;
		}
		return true;
	}

	/**
	 * Synchronously reload all of the packages in the workspace.
	 */
	public reload(): void {
		for (const pkg of this.packages) {
			pkg.reload();
		}
	}

	public toString(): string {
		return `${this.name} (WORKSPACE)`;
	}

	/**
	 * Load a workspace from a {@link WorkspaceDefinition}.
	 *
	 * @param name - The name of the workspace.
	 * @param definition - The definition for the workspace.
	 * @param root - The path to the root of the workspace.
	 * @param buildProject - The build project that the workspace belongs to.
	 * @returns A loaded {@link IWorkspace}.
	 */
	public static load(
		name: string,
		definition: WorkspaceDefinition,
		root: string,
		buildProject: IBuildProject,
	): IWorkspace {
		const workspace = new Workspace(name, definition, root, buildProject);
		return workspace;
	}
}
