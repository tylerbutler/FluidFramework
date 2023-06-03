/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { Package } from "@fluidframework/build-tools";
import { Flags } from "@oclif/core";
import { ensureFile } from "fs-extra";
import matter from "gray-matter";
import globby from "globby";
import { strict as assert } from "node:assert";
import path from "node:path";
import fs from "node:fs/promises";
import { format as prettier } from "prettier";
import replace from "replace-in-file";

import { PackageCommand } from "../../BasePackageCommand";
import { ReleasePackage } from "../..";
import { VersionBumpType } from "@fluid-tools/version-tools";
import { CommandLogger } from "../../logging";

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
	private changeType: VersionBumpType | undefined;

	public async init(): Promise<void> {
		await super.init();

		if (this.argv.length === 0) {
			this.error("No packages selected.", { exit: 1 });
		}

		const context = await this.getContext();
		const { type, changesets } = await loadChangesets(
			path.join(context.repo.resolvedRoot, ".changeset"),
			this.logger,
		);
		this.changesets = changesets;
		this.changeType = type;
	}

	protected async processPackage(directory: string): Promise<void> {
		const context = await this.getContext();
		const pkg = new Package(path.join(directory, "package.json"), "none");
		const pkgName = pkg.name;
		const version = pkg.version;

		if (!context.fullPackageMap.has(pkgName)) {
			this.warning(`Package ${pkgName} not found in context.`);
		}

		const pattern = new RegExp(`# ${pkgName}\n\n`);
		let replacement = `# ${pkgName}\n\n## ${version}\n\n`;
		const entries = this.changesets.get(pkgName);

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
			replacement += `### ${
				// eslint-disable-next-line unicorn/prefer-spread
				this.changeType?.charAt(0)?.toUpperCase().concat(this.changeType?.slice(1))
			} Changes\n\n`;
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

async function loadChangesets(
	dir: string,
	log?: CommandLogger,
): Promise<{
	type: VersionBumpType;
	changesets: Map<ReleasePackage, string[]>;
}> {
	const changesetMap = new Map<ReleasePackage, string[]>();
	const changesetFiles = await globby(["*.md", "!README.md"], { cwd: dir, absolute: true });
	let changeType: VersionBumpType | undefined;

	for (const file of changesetFiles) {
		const m = matter.read(file);

		for (const [pkgName, type] of Object.entries(m.data)) {
			changeType = changeType ?? type;
			if (type !== changeType) {
				log?.warning(`Unexpected change type: ${type} (expected ${changeType})`);
			}
			const entries = changesetMap.get(pkgName) ?? [];
			entries.push(m.content);
			changesetMap.set(pkgName, entries);
		}
	}

	if (changeType === undefined) {
		throw new Error(`No change type found.`);
	}

	return { type: changeType, changesets: changesetMap };
}

async function prettierFile(file: string): Promise<void> {
	const content = await fs.readFile(file);
	const formatted = prettier(content.toString(), { parser: "markdown", proseWrap: "never" });
	await fs.writeFile(file, formatted);
}
