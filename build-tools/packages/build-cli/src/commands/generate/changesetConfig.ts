/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import type { PackageName } from "@fluid-tools/build-infrastructure";
import { Flags } from "@oclif/core";
import { mkdirp, readJSON, writeJSON } from "fs-extra/esm";
import sortObject from "sort-object-keys";

import { type ChangesetConfigWritten } from "../../config.js";
import { workspaceNameFlag } from "../../flags.js";
import { BaseCommand } from "../../library/index.js";

const defaultConfig: ChangesetConfigWritten = {
	$schema: "https://unpkg.com/@changesets/config@2.3.0/schema.json",
	commit: false,
	access: "public",
	baseBranch: "main",
	updateInternalDependencies: "patch",
};

export default class GenerateChangesetConfigCommand extends BaseCommand<
	typeof GenerateChangesetConfigCommand
> {
	static readonly summary = "Generates a configuration file for changesets.";

	static readonly description =
		"This command is used to dynamically create fixed and linked package groups in the changesets config. Existing settings in the changeset config will be retained EXCEPT for fixed and linked groups. Those are always overwritten.";

	// Enables the global JSON flag in oclif.
	static readonly enableJsonFlag = true;

	static readonly flags = {
		workspace: workspaceNameFlag({
			// Changeset config is currently per-workspace/release group, so require a release group to be provided.
			required: true,
		}),
		outFile: Flags.file({
			char: "o",
			description:
				"Path to write the changeset config file to. The file will always be overwritten.",
			default: ".changeset/config.json",
		}),
		...BaseCommand.flags,
	} as const;

	public async run(): Promise<ChangesetConfigWritten> {
		const { workspace: workspaceName, outFile } = this.flags;
		const repo = await this.getBuildProject();
		const workspace = repo.workspaces.get(workspaceName);

		if (workspace === undefined) {
			this.error(`Workspace ${workspace} not found in Fluid repo`, { exit: 1 });
		}

		const currentConfig: ChangesetConfigWritten = existsSync(outFile)
			? ((await readJSON(outFile)) as ChangesetConfigWritten)
			: defaultConfig;

		const newConfig = { ...defaultConfig, ...currentConfig };

		// Always override the 'fixed' packages.
		const fixedPackages: PackageName[][] = [];
		for (const releaseGroup of workspace.releaseGroups.values()) {
			fixedPackages.push(
				releaseGroup.packages
					.filter(
						// exclude release group root packages because the changesets CLI doesn't recognize them
						(p) => !p.isReleaseGroupRoot,
					)
					.map((p) => p.name),
			);
		}
		newConfig.fixed = fixedPackages;

		await mkdirp(path.dirname(outFile));
		await writeJSON(outFile, sortObject(newConfig), { spaces: "\t" });

		return sortObject(newConfig);
	}
}
