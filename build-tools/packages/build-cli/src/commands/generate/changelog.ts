/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { Package } from "@fluidframework/build-tools";
import { Flags } from "@oclif/core";
import chalk from "chalk";
import matter from "gray-matter";
import globby from "globby";
import { strict as assert } from "node:assert";
import path from "node:path";

import { BaseCommand } from "../../base";
import { PackageCommand } from "../../BasePackageCommand";
import { ReleasePackage } from "../..";

const DEFAULT_BRANCH = "main";

/**
 * Package scopes that will be excluded by default. The default list contains scopes that are not typically published to
 * a public registry, and thus are the least likely to have a changeset-relevant change.
 */
const excludedScopes = new Set(["@fluid-example", "@fluid-internal", "@fluid-test"]);

/**
 * Represents a choice in the CLI prompt UX.
 */
interface Choice {
	title: string;
	value?: Package;
	disabled?: boolean;
	selected?: boolean;
	heading?: boolean;
}

export default class GenerateChangelogCommand extends PackageCommand<
	typeof GenerateChangelogCommand
> {
	static summary = `Generates changelog entries for packages based on available changesets.`;

	// Enables the global JSON flag in oclif.
	static enableJsonFlag = true;

	static examples = [
		// {
		// 	description: "Create an empty changeset using the --empty flag.",
		// 	command: "<%= config.bin %> <%= command.id %> --empty",
		// },
		// {
		// 	description: `Create a changeset interactively. Any package whose contents has changed relative to the '${DEFAULT_BRANCH}' branch will be selected by default.`,
		// 	command: "<%= config.bin %> <%= command.id %>",
		// },
		// {
		// 	description: `You can compare with a different branch using --branch (-b).`,
		// 	command: "<%= config.bin %> <%= command.id %> --branch next",
		// },
		// {
		// 	description: `By default example and private packages are excluded, but they can be included with --all.`,
		// 	command: "<%= config.bin %> <%= command.id %> --all",
		// },
	];

	private changesets: Map<ReleasePackage, string[]> = new Map();

	public async init(): Promise<void> {
		await super.init();
		const context = await this.getContext();
		this.changesets = await loadChangesets(path.join(context.repo.resolvedRoot, ".changeset"));
	}

	// public async run(): Promise<void> {
	// 	const context = await this.getContext();
	// 	this.changesets = await loadChangesets(path.join(context.repo.resolvedRoot, ".changeset"));

	// 	// Calls processPackage on all packages.
	// 	await super.run();
	// }

	protected async processPackage(directory: string): Promise<void> {
		const context = await this.getContext();
		const pkgRaw = new Package(path.join(directory, "package.json"), "none");
		const pkgName = pkgRaw.name;

		if (!context.fullPackageMap.has(pkgName)) {
			this.warning(`Package ${pkgName} not found.`);
		}

		const entries = this.changesets.get(pkgName);

		if (entries === undefined || entries.length === 0) {
			this.verbose(`${pkgName}: No changes`);
			return;
		}

		this.warning(
			`${pkgName}: ${entries.length} ${entries.length === 1 ? "change" : "changes"}`,
		);
	}
}

async function loadChangesets(dir: string): Promise<Map<ReleasePackage, string[]>> {
	const changesetMap = new Map<ReleasePackage, string[]>();
	const changesetFiles = await globby(["*.md", "!README.md"], { cwd: dir, absolute: true });

	for (const file of changesetFiles) {
		const m = matter.read(file);

		for (const [pkgName] of Object.entries(m.data)) {
			const entries = changesetMap.get(pkgName) ?? [];
			entries.push(m.content);
			changesetMap.set(pkgName, entries);
		}
	}

	return changesetMap;
}
