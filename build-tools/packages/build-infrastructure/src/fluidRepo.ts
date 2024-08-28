import path from "node:path";
import { getFluidRepoLayout } from "./config.js";
import type { IFluidRepo, IWorkspace, PackageManager } from "./interfaces.js";
import { Workspace } from "./workspace.js";

export class FluidRepo implements IFluidRepo {
	public readonly root: string;

	public constructor(
		root: string,
		public readonly packageManager: PackageManager,
	) {
		this.root = path.resolve(root);

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
				const ws = Workspace.load(name, definition);
				return [name, ws];
			}),
		);
	}

	private readonly _workspaces: Map<string, IWorkspace>;
	public get workspaces() {
		return this._workspaces;
	}
}

export function loadFluidRepo(...args: ConstructorParameters<typeof FluidRepo>): IFluidRepo {
	return new FluidRepo(...args);
}
