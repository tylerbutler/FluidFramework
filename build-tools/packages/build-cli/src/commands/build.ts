/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	BuildResult,
	DefaultFastBuildOptions,
	type FastBuildOptions,
	FluidRepoBuild,
	MonoRepoKind,
	Timer,
} from "@fluidframework/build-tools";
import { Args, Flags } from "@oclif/core";
import chalk from "chalk";
import { existsSync } from "fs";
import path from "path";

import { BaseCommand } from "../base";
import { releaseGroupFlag } from "../flags";

const { custom } = Args;

type Id = string;
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type IdOpts = { startsWith: string; length: number };

export const myArg = custom<Id, IdOpts>({
	parse: async (input, ctx, opts) => {
		if (input.startsWith(opts.startsWith) && input.length === opts.length) {
			return input;
		}

		throw new Error("Invalid id");
	},
});

// const pkgFilterArg = Args.custom<string | RegExp, unknown>({
// 	name: "pkgFilter",
// 	description: "Regular expression to match the package name.",
// 	required: false,
// 	parse: async (input): Promise<RegExp | string> => {
// 		const resolvedPath = path.resolve(input);
// 		if (existsSync(path.resolve(input))) {
// 			return resolvedPath;
// 		}
// 		return new RegExp(input);
// 	},
// });

export default class BuildCommand extends BaseCommand<typeof BuildCommand> {
	static summary = "";

	static description = ``;

	static state = "experimental";

	// static args = {
	// 	pkgFilter: pkgFilterArg,
	// };

	static flags = {
		clean: Flags.boolean({
			char: "c",
			description: "Runs the 'clean' script on matched packages.",
		}),
		dep: Flags.boolean({
			char: "d",
			description:
				"Apply actions (clean/force/rebuild) to matched packages and their dependent packages.",
			default: DefaultFastBuildOptions.matchedOnly,
		}),
		depCheck: Flags.boolean({
			description: "DepCheck.",
			default: DefaultFastBuildOptions.depcheck,
		}),
		fix: Flags.boolean({
			char: "f",
			description: "Auto fix warning from package check if possible.",
			default: DefaultFastBuildOptions.fix,
		}),
		force: Flags.boolean({
			description: "Force build and ignore dependency check on matched packages.",
			default: DefaultFastBuildOptions.force,
		}),
		hoist: Flags.boolean({
			description: "Hoist.",
			default: !DefaultFastBuildOptions.nohoist,
		}),
		install: Flags.boolean({
			description:
				"Run 'npm install' for all packages and release groups. This skips a package if node_modules already exists; it can not be used to update in response to changes to the package.json.",
			default: DefaultFastBuildOptions.install,
		}),
		lint: Flags.boolean({
			description: "Lint.",
			default: !DefaultFastBuildOptions.nolint,
		}),
		rebuild: Flags.boolean({
			char: "r",
			description: "Clean and build all matched packages.",
		}),
		reinstall: Flags.boolean({
			description: "Same as --uninstall --install.",
		}),
		releaseGroup: releaseGroupFlag({
			char: "g",
			description: "Operate only on this release group.",
		}),
		samples: Flags.boolean({
			allowNo: true,
			description: "Samples.",
			default: DefaultFastBuildOptions.samples,
		}),
		script: Flags.string({
			char: "s",
			description: "npm script to execute.",
			default: ["build"],
			multiple: true,
		}),
		services: Flags.boolean({
			description: "Services.",
			default: DefaultFastBuildOptions.services,
		}),
		showExec: Flags.boolean({
			description: "showExec",
			default: DefaultFastBuildOptions.showExec,
		}),
		symlink: Flags.string({
			description: `Fix symlinks between packages within release groups. The 'isolate' mode configures the symlinks to only connect within each release group. This is the configuration tested by CI and should be kept working.

      The 'full' mode symlinks everything in the repo together. CI does not ensure this configuration is functional, so it may or may not work.`,
			options: ["isolated", "full"],
			default: "isolated",
		}),
		uninstall: Flags.boolean({
			description:
				"Clean all node_modules. This errors if some node_modules folders do not exist; if you hit this limitation you can do an --install first to work around it.",
		}),
		vscode: Flags.boolean({
			description:
				"Output error messages to work with the default problem matcher in vscode.",
		}),
		worker: Flags.boolean({
			description: "Enable workers.",
			default: false,
		}),
		workerThreads: Flags.boolean({
			description: "Enable worker threads.",
			dependsOn: ["worker"],
		}),
		workerMemoryLimitMB: Flags.integer({
			description: "Set worker memory limit.",
			dependsOn: ["worker"],
		}),
		logtime: Flags.boolean({
			description: "Display the current time on every status message for logging.",
		}),
		...BaseCommand.flags,
	};

	static examples = [
		{
			description: "",
			command: "<%= config.bin %> <%= command.id %>",
		},
	];

	resolveOptions(): FastBuildOptions {
		const setBuild = (build: boolean): void => {
			if (build || opt.build === undefined) {
				opt.build = build;
			}
		};

		const args = this.args;
		const flags = this.flags;
		const opt: FastBuildOptions = Object.create(DefaultFastBuildOptions);

		if (args.pkgFilter?.length > 0) {
			if (typeof args.pkgFilter === "string") {
				opt.dirs.push(args.pkgFilter);
			} else {
				opt.match.push(args.pkgFilter);
			}
		}

		opt.matchedOnly = !flags.dep;

		if (flags.dep === true) {
			opt.matchedOnly = false;
		}

		if (flags.rebuild === true) {
			opt.force = true;
			opt.clean = true;
			setBuild(true);
		}

		if (flags.clean === true) {
			opt.force = true;
			opt.clean = true;
			setBuild(false);
		}

		if (flags.force === true) {
			opt.force = true;
		}

		opt.samples = flags.samples;

		if (flags.fix === true) {
			opt.fix = true;
			setBuild(false);
		}

		opt.nohoist = !flags.hoist;
		opt.install = flags.install || flags.reinstall;
		opt.uninstall = flags.uninstall || flags.reinstall;
		opt.services = flags.services;
		opt.all = this.args.pkgFilter === undefined;

		opt.azure = flags.releaseGroup === MonoRepoKind.Azure;
		opt.server = flags.releaseGroup === MonoRepoKind.Server;

		if (flags.script.length > 0) {
			opt.buildScriptNames.push(...flags.script);
			setBuild(true);
		}

		opt.symlink = flags.symlink !== undefined;
		opt.fullSymlink = flags.symlink === "full";
		opt.nolint = !flags.lint;
		opt.showExec = flags.showExec;
		opt.worker = flags.worker;
		opt.vscode = flags.vscode;

		opt.workerMemoryLimit = (flags.workerMemoryLimitMB ?? 1) * 1024 * 1024;

		return opt;
	}

	public async run(): Promise<void> {
		const flags = this.flags;

		const timer = new Timer(flags.timer);
		const context = await this.getContext();
		const resolvedRoot = context.gitRepo.resolvedRoot;

		this.info(`Fluid Repo Root: ${resolvedRoot}`);

		const options = this.resolveOptions();

		// Detect nohoist state mismatch and infer uninstall switch
		if (flags.install === true) {
			const hasRootNodeModules = existsSync(path.join(resolvedRoot, "node_modules"));
			if (hasRootNodeModules === flags.hoist) {
				// We need to uninstall if nohoist doesn't match the current state of installation
				options.uninstall = true;
			}
		}

		// Load the package
		const repo = new FluidRepoBuild(resolvedRoot, options.services);
		timer.time("Package scan completed");

		// Set matched package based on options filter
		const matched = repo.setMatched(options);
		if (matched === false) {
			this.error("No package matched", { exit: -4 });
		}

		// Dependency checks
		if (options.depcheck === true) {
			await repo.depcheck();
			timer.time("Dependencies check completed", true);
		}

		// Uninstall
		if (options.uninstall === true) {
			if (!(await repo.uninstall())) {
				this.error(`uninstall failed`, { exit: -8 });
			}
			timer.time("Uninstall completed", true);

			if (options.install === false) {
				let errorStep: string | undefined;
				// eslint-disable-next-line unicorn/prefer-switch
				if (options.symlink === true) {
					errorStep = "symlink";
				} else if (options.clean === true) {
					errorStep = "clean";
				} else if (options.build === true) {
					errorStep = "build";
				}
				if (errorStep !== undefined) {
					console.warn(`WARNING: Skipping ${errorStep} after uninstall`);
				}
				this.exit(0);
			}
		}

		// Install or check install
		if (options.install === true) {
			this.info("Installing packages");
			if (!(await repo.install(options.nohoist))) {
				this.error(`Install failed`, { exit: -5 });
			}
			timer.time("Install completed", true);
		}

		// Symlink check
		const symlinkTaskName = options.symlink === true ? "Symlink" : "Symlink check";
		await repo.symlink(options);
		timer.time(`${symlinkTaskName} completed`, options.symlink);

		// Check scripts
		await repo.checkPackages(options.fix);
		timer.time("Check scripts completed");

		let failureSummary = "";
		if (options.clean === true || options.build !== false) {
			this.info(
				`Symlink in ${
					options.fullSymlink === true
						? "full"
						: options.fullSymlink === false
						? "isolated"
						: "non-dependent"
				} mode`,
			);

			// build the graph
			const buildGraph = repo.createBuildGraph(options, options.buildScriptNames);
			timer.time("Build graph creation completed");

			// Check install
			if (!(await buildGraph.checkInstall())) {
				this.error("Dependency not installed. Use --install to fix.", { exit: -10 });
			}
			timer.time("Check install completed");

			if (options.clean === true) {
				if (!(await buildGraph.clean())) {
					this.error(`Clean failed`, { exit: -9 });
				}
				timer.time("Clean completed");
			}

			if (options.build !== false) {
				// Run the build
				const buildResult = await buildGraph.build(timer);
				const buildStatus = buildResultString(buildResult);
				const elapsedTime = timer.time();
				if (flags.timer === true) {
					const totalElapsedTime = buildGraph.totalElapsedTime;
					const concurrency = buildGraph.totalElapsedTime / elapsedTime;
					this.info(
						`Execution time: ${totalElapsedTime.toFixed(
							3,
						)}s, Concurrency: ${concurrency.toFixed(3)}`,
					);
					this.info(`Build ${buildStatus} - ${elapsedTime.toFixed(3)}s`);
				} else {
					this.info(`Build ${buildStatus}`);
				}
				failureSummary = buildGraph.taskFailureSummary;
			}
		}

		if (options.build === false) {
			this.info(`Other switches with no explicit build script, not building.`);
		}

		this.info(`Total time: ${(timer.getTotalTime() / 1000).toFixed(3)}s`);

		if (failureSummary !== "") {
			this.log(`\n${failureSummary}`);
		}
	}
}

function buildResultString(buildResult: BuildResult): string {
	switch (buildResult) {
		case BuildResult.Success:
			return chalk.greenBright("succeeded");
		case BuildResult.Failed:
			return chalk.redBright("failed");
		case BuildResult.UpToDate:
			return chalk.cyanBright("up to date");
		default:
			throw new Error(`Unknown BuildResult: ${buildResult}`);
	}
}
