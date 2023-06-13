/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { loadAllChangesets, summarizeChangesets } from "@fluid-internal/changeset-summarizer";
import { VersionBumpType } from "@fluid-tools/version-tools";
import { Package } from "@fluidframework/build-tools";
import { Flags } from "@oclif/core";
import chalk from "chalk";
import humanId from "human-id";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { format as prettier } from "prettier";
import prompts from "prompts";

import { BaseCommand } from "../../base";
import { Repository, getDefaultBumpTypeForBranch } from "../../lib";

const DEFAULT_BRANCH = "main";

export default class SummarizeChangesetCommand extends BaseCommand<
	typeof SummarizeChangesetCommand
> {
	static summary = ``;

	// Enables the global JSON flag in oclif.
	static enableJsonFlag = true;

	// static flags = {
	// 	branch: Flags.string({
	// 		char: "b",
	// 		description: `The branch to compare the current changes against. The current changes will be compared with this branch to populate the list of changed packages. ${chalk.bold(
	// 			"You must have a valid remote pointing to the microsoft/FluidFramework repo.",
	// 		)}`,
	// 		default: DEFAULT_BRANCH,
	// 	}),
	// 	empty: Flags.boolean({
	// 		description: `Create an empty changeset file. If this flag is used, all other flags are ignored. A new, randomly named changeset file will be created every time --empty is used.`,
	// 	}),
	// 	all: Flags.boolean({
	// 		description: `Include ALL packages, including examples and other unpublished packages.`,
	// 		default: false,
	// 	}),
	// 	uiMode: Flags.string({
	// 		description: `Controls the mode in which the interactive UI is displayed. The 'default' mode includes an autocomplete filter to narrow the list of packages. The 'simple' mode does not include the autocomplete filter, but has better UI that may display better in some terminal configurations. This flag is experimental and may change or be removed at any time.`,
	// 		default: "default",
	// 		options: ["default", "simple"],
	// 		helpGroup: "EXPERIMENTAL",
	// 	}),
	// 	...BaseCommand.flags,
	// };

	static examples = [
		{
			description: "Create an empty changeset using the --empty flag.",
			command: "<%= config.bin %> <%= command.id %> --empty",
		},
		{
			description: `Create a changeset interactively. Any package whose contents has changed relative to the '${DEFAULT_BRANCH}' branch will be selected by default.`,
			command: "<%= config.bin %> <%= command.id %>",
		},
		{
			description: `You can compare with a different branch using --branch (-b).`,
			command: "<%= config.bin %> <%= command.id %> --branch next",
		},
		{
			description: `By default example and private packages are excluded, but they can be included with --all.`,
			command: "<%= config.bin %> <%= command.id %> --all",
		},
	];

	public async run(): Promise<void> {
		const context = await this.getContext();

		const changesets = await loadAllChangesets(
			path.join(context.repo.resolvedRoot, ".changeset"),
		);

		const foo = await summarizeChangesets(
			path.join(context.repo.resolvedRoot, ".changeset"),
			path.join(context.repo.resolvedRoot, "BREAKING.md"),
		);
	}
}
