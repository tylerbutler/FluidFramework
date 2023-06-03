/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { Package } from "@fluidframework/build-tools";
import { Flags } from "@oclif/core";
import { ensureFile } from "fs-extra";
import matter from "gray-matter";
import globby from "globby";
import path from "node:path";
import fs from "node:fs/promises";
import { format as prettier, resolveConfig as resolvePrettierConfig } from "prettier";
import replace from "replace-in-file";

import { PackageCommand } from "../../BasePackageCommand";
import { ReleasePackage } from "../..";

export default class GenerateChangelogCommand extends PackageCommand<
	typeof GenerateChangelogCommand
> {
	static summary = `Generates changelog entries for packages based on available changesets.`;

	// Enables the global JSON flag in oclif.
	static enableJsonFlag = true;

	static flags = {
		changed: Flags.boolean({
			description:
				"Generate changelogs only for packages with changesets that apply to them. Useful for testing.",
			default: true,
			allowNo: true,
			helpGroup: "CHANGELOG GENERATION",
		}),
		...PackageCommand.flags,
	};

	static examples = [
		{
			description: "Generate changelogs for the client release group.",
			command: "<%= config.bin %> <%= command.id %> --releaseGroup client",
		},
	];

	private changesets: Map<ReleasePackage, string[]> = new Map();

	public async init(): Promise<void> {
		await super.init();

		if (this.argv.length === 0) {
			this.error("No packages selected.", { exit: 1 });
		}

		const context = await this.getContext();
		this.changesets = await loadChangesets(path.join(context.repo.resolvedRoot, ".changeset"));
	}

	protected async processPackage(directory: string): Promise<void> {
		const context = await this.getContext();
		const pkg = new Package(path.join(directory, "package.json"), "none");
		const pkgName = pkg.name;
		const version = pkg.version;

		if (!context.fullPackageMap.has(pkgName)) {
			this.warning(`Package ${pkgName} not found in context.`);
		}

		const entries = this.changesets.get(pkgName);
		const pattern = new RegExp(`# ${pkgName}\n\n`);
		let replacement = `# ${pkgName}\n\n## ${version}\n\n`;

		if (entries === undefined || entries.length === 0) {
			this.verbose(`${pkgName}: No changes`);
			if (this.flags.changed) {
				return;
			}
			replacement += `Dependency updates only.\n\n`;
		} else {
			this.warning(
				`${pkgName}: ${entries.length} ${entries.length === 1 ? "change" : "changes"}`,
			);
			for (const entry of entries) {
				replacement += `-   ${entry.trim()}\n\n`;
			}
		}

		const changelogPath = path.join(directory, "CHANGELOG.md");
		await ensureFile(changelogPath);
		await replace.replaceInFile({
			files: changelogPath,
			from: pattern,
			to: replacement,
		});

		await prettierFile(changelogPath);
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

async function prettierFile(file: string): Promise<void> {
	const content = await fs.readFile(file);
	const formatted = prettier(content.toString(), { parser: "markdown", proseWrap: "never" });
	await fs.writeFile(file, formatted);
}
