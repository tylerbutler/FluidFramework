/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { detectSync, type Agent } from "package-manager-detector";
import { resolveCommand } from "package-manager-detector/commands";

import type { IPackageManager, PackageManagerName } from "./types.js";

export class PackageManager implements IPackageManager {
	/**
	 * Instantiates a new package manager object. Prefer the {@link createPackageManager} function, which retuns an
	 * {@link IPackageManager}, to calling the constructor directly.
	 */
	public constructor(
		public readonly name: PackageManagerName,
		private readonly agent: Agent,
	) {}

	/**
	 * {@inheritdoc IPackageManager.getInstallCommandWithArgs}
	 */
	public getInstallCommandWithArgs(updateLockfile: boolean): string[] {
		const resolvedCommand = resolveCommand(
			this.agent,
			updateLockfile ? "install" : "frozen",
			[],
		);

		if (resolvedCommand === null) {
			throw new Error("Cannot generate command");
		}
		const { command, args } = resolvedCommand;
		console.log(`${command} ${args.join(" ")}`); // 'pnpm add -g @antfu/ni'
		return [command, ...args];
	}
}

/**
 * Create a new package manager instance.
 */
export function createPackageManager(name: PackageManagerName): IPackageManager {
	return new PackageManager(name);
}

export function detectPackageManager(cwd = process.cwd()): IPackageManager {
	const result = detectSync({
		cwd,
		onUnknown: (pm) => {
			throw new Error(`Unknown package manager: ${pm}`);
		},
	});

	if (result === null) {
		throw new Error(`Package manager could not be detected. Started looking at '${cwd}'.`);
	}

	return new PackageManager();
}
