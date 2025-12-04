/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { IPackage } from "@fluid-tools/build-infrastructure";
import { Args } from "@oclif/core";
import execa from "execa";

import {
	BuildProjectPackageCommand,
	type PackageSelectionDefault,
} from "../../library/commands/buildProjectPackageCommand.js";

/**
 * Runs a shell command in the context of packages within the BuildProject.
 *
 * This command is a vnext version that uses the build-infrastructure package APIs.
 */
export default class ExecCommand extends BuildProjectPackageCommand<typeof ExecCommand> {
	static readonly summary =
		`Run a shell command in the context of a package or release group.`;

	static readonly description =
		`This command runs a shell command in the context of packages within the BuildProject.
You can select packages using the --releaseGroup or --all flags.`;

	static readonly args = {
		cmd: Args.string({
			description: "The shell command to execute.",
			required: true,
		}),
	} as const;

	static readonly flags = {
		...BuildProjectPackageCommand.flags,
	} as const;

	static readonly examples = [
		{
			description: "Run 'npm ls' in all packages",
			command: "<%= config.bin %> <%= command.id %> --all 'npm ls'",
		},
		{
			description: "Run a script in packages within a release group",
			command: "<%= config.bin %> <%= command.id %> --releaseGroup client 'npm run build'",
		},
	];

	protected defaultSelection: PackageSelectionDefault = "all";

	protected async processPackage(pkg: IPackage): Promise<void> {
		const { cmd } = this.args;
		this.verbose(`Running '${cmd}' in ${pkg.name} (${pkg.directory})`);
		await execa.command(cmd, {
			cwd: pkg.directory,
			stdio: "inherit",
			shell: true,
		});
	}
}
