/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	type IPackage,
	type PackageFilterOptions,
	type PackageSelectionCriteria,
	type ReleaseGroupName,
	selectAndFilterPackages,
} from "@fluid-tools/build-infrastructure";
import { type Command, Flags, ux } from "@oclif/core";
import async from "async";

import { BaseCommandWithBuildProject } from "./base.js";

/**
 * The default to use as selection criteria when none is explicitly provided by the user. This enables commands
 * without flags to operate on a collection of packages by default that make sense based on the command.
 *
 * @remarks
 * This type matches the `PackageSelectionDefault` type in `flags.ts`. It's defined here to avoid circular
 * dependencies between this module and `flags.ts`.
 */
export type PackageSelectionDefault = "all" | "dir" | undefined;

/**
 * A re-usable CLI flag to parse release group names.
 *
 * @remarks
 * This matches `releaseGroupNameFlag` in `flags.ts`. It's defined here to avoid circular dependencies.
 */
const releaseGroupNameFlag = Flags.custom<ReleaseGroupName>({
	description: "The name of a release group.",
	char: "g",
	parse: async (input) => {
		return input as ReleaseGroupName;
	},
});

/**
 * Filter flags for package filtering.
 *
 * @remarks
 * These match `filterFlags` in `flags.ts`. They're defined here to avoid circular dependencies.
 */
const filterFlags = {
	private: Flags.boolean({
		description:
			"Only include private packages. Use --no-private to exclude private packages instead.",
		allowNo: true,
		helpGroup: "PACKAGE FILTER",
	}),
	scope: Flags.string({
		description:
			"Package scopes to filter to. If provided, only packages whose scope matches the flag will be included. Cannot be used with --skipScope.",
		exclusive: ["skipScope"],
		multiple: true,
		helpGroup: "PACKAGE FILTER",
	}),
	skipScope: Flags.string({
		description:
			"Package scopes to filter out. If provided, packages whose scope matches the flag will be excluded. Cannot be used with --scope.",
		exclusive: ["scope"],
		aliases: ["no-scope"],
		multiple: true,
		helpGroup: "PACKAGE FILTER",
	}),
} as const;

/**
 * A base command for vnext commands that operate on packages within a BuildProject.
 *
 * This class mirrors the legacy `PackageCommand` but uses the build-infrastructure APIs.
 * Subclasses only need to implement the `processPackage` method to handle per-package logic.
 *
 * @remarks
 *
 * This command provides package selection via `--all` or `--releaseGroup` flags, and processes
 * packages concurrently using async.mapLimit.
 */
export abstract class BuildProjectPackageCommand<
	T extends typeof Command & { flags: typeof BuildProjectPackageCommand.flags },
> extends BaseCommandWithBuildProject<T> {
	static readonly flags = {
		releaseGroup: releaseGroupNameFlag({
			description: "Run on packages within this release group. Cannot be used with --all.",
			exclusive: ["all"],
		}),
		all: Flags.boolean({
			description:
				"Run on all packages in the BuildProject. Cannot be used with --releaseGroup.",
			exclusive: ["releaseGroup"],
		}),
		concurrency: Flags.integer({
			description: "The number of tasks to execute concurrently.",
			default: 25,
		}),
		...filterFlags,
		...BaseCommandWithBuildProject.flags,
	} as const;

	/**
	 * The default to use as selection criteria when none is explicitly provided by the user. This enables commands
	 * without flags to operate on a collection of packages by default that make sense based on the command.
	 */
	protected abstract get defaultSelection(): PackageSelectionDefault;
	protected abstract set defaultSelection(value: PackageSelectionDefault);

	/**
	 * An array of packages selected based on the selection criteria.
	 *
	 * @remarks
	 *
	 * Note that these packages are not necessarily the ones that are acted on. Packages are selected, then that list is
	 * further narrowed by filtering criteria, so this array may contain packages that are not acted on.
	 */
	protected selectedPackages: IPackage[] | undefined;

	/**
	 * The list of packages after all filters are applied to the selected packages.
	 */
	protected filteredPackages: IPackage[] | undefined;

	/**
	 * Called for each package that is selected/filtered based on the filter flags passed in to the command.
	 *
	 * @param pkg - The package being processed.
	 */
	protected abstract processPackage(pkg: IPackage): Promise<void>;

	/**
	 * Parses flags and returns the selection and filter options.
	 */
	protected parseSelectionAndFilterOptions(): {
		selection: PackageSelectionCriteria;
		filter: PackageFilterOptions;
	} {
		const { all, releaseGroup: releaseGroupName } = this.flags;

		// Determine if we should use the default selection
		const useDefault = all !== true && releaseGroupName === undefined;

		let selection: PackageSelectionCriteria;

		if (all === true || (useDefault && this.defaultSelection === "all")) {
			selection = {
				workspaces: ["*"],
				workspaceRoots: ["*"],
				releaseGroups: [],
				releaseGroupRoots: [],
				directory: undefined,
				changedSinceBranch: undefined,
			};
		} else if (useDefault && this.defaultSelection === "dir") {
			selection = {
				workspaces: [],
				workspaceRoots: [],
				releaseGroups: [],
				releaseGroupRoots: [],
				directory: ".",
				changedSinceBranch: undefined,
			};
		} else if (releaseGroupName === undefined) {
			this.error(
				"You must specify either --all to run on all packages or --releaseGroup to run on packages in a specific release group.",
			);
		} else {
			selection = {
				workspaces: [],
				workspaceRoots: [],
				releaseGroups: [releaseGroupName],
				releaseGroupRoots: [],
				directory: undefined,
				changedSinceBranch: undefined,
			};
		}

		const filter: PackageFilterOptions = {
			private: this.flags.private,
			scope: this.flags.scope,
			skipScope: this.flags.skipScope,
		};

		return { selection, filter };
	}

	/**
	 * Selects and filters packages based on flags and the defaultSelection.
	 */
	protected async selectAndFilterPackages(): Promise<void> {
		const buildProject = this.getBuildProject();
		const { selection, filter } = this.parseSelectionAndFilterOptions();

		const { selected, filtered } = await selectAndFilterPackages(
			buildProject,
			selection,
			filter,
		);

		this.selectedPackages = selected;
		this.filteredPackages = filtered;
	}

	public async run(): Promise<unknown> {
		await this.selectAndFilterPackages();

		if (this.filteredPackages === undefined || this.filteredPackages.length === 0) {
			this.error("No packages selected.");
		}

		this.info(
			`Processing ${this.filteredPackages.length} packages (selected ${this.selectedPackages?.length ?? 0})`,
		);

		const errors = await this.processPackages(this.filteredPackages);
		if (errors.length > 0) {
			this.errorLog(`Completed with ${errors.length} errors.`);
			for (const error of errors) {
				this.errorLog(error);
			}
			this.exit(1);
		}

		return undefined;
	}

	/**
	 * Runs the processPackage method on each package in the provided array.
	 *
	 * @returns An array of error strings. If the array is not empty, at least one of the calls to processPackage failed.
	 */
	protected async processPackages(packages: IPackage[]): Promise<string[]> {
		let started = 0;
		let finished = 0;
		let succeeded = 0;
		const errors: string[] = [];

		// In verbose mode, we output a log line per package. In non-verbose mode, we want to display an activity
		// spinner, so we only start the spinner if verbose is false.
		const { verbose, concurrency } = this.flags;

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
					await this.processPackage(pkg);
					succeeded += 1;
				} catch (error: unknown) {
					const errorString = `Error processing ${pkg.name}: '${error}'\nStack: ${
						(error as Error).stack
					}`;
					errors.push(errorString);
					this.verbose(errorString);
				} finally {
					finished += 1;
					updateStatus();
				}
			});
		} finally {
			// Stop the spinner if needed.
			if (verbose !== true) {
				ux.action.stop(`Done. ${packages.length} Packages. ${finished - succeeded} Errors`);
			}
		}
		return errors;
	}
}
