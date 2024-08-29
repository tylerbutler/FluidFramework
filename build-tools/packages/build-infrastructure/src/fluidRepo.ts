/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import * as childProcess from "node:child_process";
import path from "node:path";

import { getFluidRepoLayout } from "./config.js";
import type { IFluidRepo, IPackage, IWorkspace } from "./types.js";
import { Workspace } from "./workspace.js";

export class FluidRepo implements IFluidRepo {
	public readonly root: string;

	public constructor(
		root?: string,
		// public readonly packageManager: PackageManager,
	) {
		this.root = root === undefined ? findGitRoot() : path.resolve(root);
		const config = getFluidRepoLayout(this.root);

		if (config.repoPackages !== undefined) {
			// TODO: Warning that this setting is deprecated.
		}

		if (config.repoLayout === undefined) {
			// TODO: load using old settings
			throw new Error("old settings");
		}

		this._workspaces = new Map<string, IWorkspace>(
			Object.entries(config.repoLayout.workspaces).map((entry) => {
				const [name, definition] = entry;
				const ws = Workspace.load(name, definition, this.root);
				return [name, ws];
			}),
		);
	}

	private readonly _workspaces: Map<string, IWorkspace>;
	public get workspaces() {
		return this._workspaces;
	}

	public get allPackages(): IPackage[] {
		const pkgs: IPackage[] = [];
		for (const ws of this.workspaces.values()) {
			pkgs.push(ws.rootPackage, ...ws.packages);
		}

		return pkgs;
	}
}

export function loadFluidRepo(...args: ConstructorParameters<typeof FluidRepo>): IFluidRepo {
	return new FluidRepo(...args);
}

/**
 * Returns the absolute path to the nearest Git repository found starting at `cwd`.
 *
 * @param cwd - The working directory to use to start searching for Git repositories. Defaults to `process.cwd()` if not
 * provided.
 */
export function findGitRoot(cwd?: string) {
	const gitRoot = childProcess
		.execSync("git rev-parse --show-toplevel", {
			cwd,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		})
		.trim();
	return gitRoot;
}
