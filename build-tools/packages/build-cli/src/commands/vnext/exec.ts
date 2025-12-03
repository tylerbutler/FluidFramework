/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { IPackage } from "@fluid-tools/build-infrastructure";
import { Args, Flags, ux } from "@oclif/core";
import async from "async";
import execa from "execa";

import { releaseGroupNameFlag } from "../../flags.js";
import { BaseCommandWithBuildProject } from "../../library/index.js";

/**
 * Runs a shell command in the context of packages within the BuildProject.
 *
 * This command is a vnext version that uses the build-infrastructure package APIs.
 */
export default class ExecCommand extends BaseCommandWithBuildProject<typeof ExecCommand> {
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
		releaseGroup: releaseGroupNameFlag({
			description:
				"Run the command in the context of packages in this release group. Cannot be used with --all.",
			exclusive: ["all"],
		}),
		all: Flags.boolean({
			description:
				"Run the command in the context of all packages in the BuildProject. Cannot be used with --releaseGroup.",
			exclusive: ["releaseGroup"],
		}),
		concurrency: Flags.integer({
			description: "The number of packages to process concurrently.",
			default: 25,
		}),
		...BaseCommandWithBuildProject.flags,
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

	public async run(): Promise<void> {
		const { cmd } = this.args;
		const { releaseGroup: releaseGroupName, all, concurrency, verbose } = this.flags;
		const buildProject = this.getBuildProject();

		let packages: IPackage[];

		if (all === true) {
			packages = [...buildProject.packages.values()];
		} else if (releaseGroupName === undefined) {
			this.error(
				"You must specify either --all to run on all packages or --releaseGroup to run on packages in a specific release group.",
			);
		} else {
			const releaseGroup = buildProject.releaseGroups.get(releaseGroupName);
			if (releaseGroup === undefined) {
				this.error(`Release group not found: ${releaseGroupName}`);
			}
			packages = releaseGroup.packages;
		}

		this.info(`Running command on ${packages.length} packages: ${cmd}`);

		const errors: string[] = [];
		let started = 0;
		let finished = 0;
		let succeeded = 0;

		const updateStatus = (): void => {
			if (verbose === true) {
				// In verbose mode, don't use the spinner
				return;
			}
			ux.action.start(
				"Processing Packages...",
				`${finished}/${packages.length}: ${started - finished} pending. Errors: ${finished - succeeded}`,
				{
					stdout: true,
				},
			);
		};

		try {
			// eslint-disable-next-line import/no-named-as-default-member
			await async.mapLimit(packages, concurrency, async (pkg: IPackage) => {
				started += 1;
				updateStatus();

				try {
					this.verbose(`Running '${cmd}' in ${pkg.name} (${pkg.directory})`);
					const result = await execa.command(cmd, {
						cwd: pkg.directory,
						stdio: "inherit",
						shell: true,
					});
					if (result.all !== undefined && result.all.length > 0) {
						this.log(result.all);
					}
					succeeded += 1;
				} catch (error: unknown) {
					const errorString = `Error in ${pkg.name}: ${error instanceof Error ? error.message : String(error)}`;
					errors.push(errorString);
					this.verbose(errorString);
				} finally {
					finished += 1;
					updateStatus();
				}
			});
		} finally {
			if (verbose !== true) {
				ux.action.stop(`Done. ${packages.length} Packages. ${finished - succeeded} Errors`);
			}
		}

		if (errors.length > 0) {
			this.errorLog(`Completed with ${errors.length} errors:`);
			for (const error of errors) {
				this.errorLog(error);
			}
			this.exit(1);
		}

		this.info("Command completed successfully on all packages.");
	}
}
