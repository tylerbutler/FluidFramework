/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { strict as assert } from "assert";
import path from "path";

import { Flags } from "@oclif/core";
import { readdir, readFile } from "fs/promises";
import { existsSync, readFileSync, writeFileSync } from "fs-extra";
import matter from "gray-matter";
import { packageOrReleaseGroupArg } from "../../args";

import { BaseCommand } from "../../base";
import { isReleaseGroup } from "../../releaseGroups";
import { MonoRepo, Package } from "@fluidframework/build-tools";
import { Repository } from "../../lib";
import { VersionBumpType } from "@fluid-tools/version-tools";

let remark;
let remarkGfm;
let remarkGitHub;

// await (async function () {
//       // eslint-disable-next-line unicorn/no-await-expression-member
//       remark = (await import('remark')).default;
//       // eslint-disable-next-line unicorn/no-await-expression-member
//       remarkGfm = (await import('remark-gfm')).default;
//       // eslint-disable-next-line unicorn/no-await-expression-member
//       remarkGitHub = (await import('remark-github')).default;
//   })();

const CHANGESET_PATH = ".changeset";
const CHANGELOG_FILENAME = "CHANGELOG.md";

interface Commit {
	summary: string;
	body: string;
	hash: string;
}

interface Changeset {
	file: string;
	packages: { [pkgName: string]: VersionBumpType };
	rawContent: string;
	commit?: Commit;
}

export default class GenerateChangelog extends BaseCommand<typeof GenerateChangelog> {
	static description = `Generate a changelog based on changeset files.`;

	static args = {
		package_or_release_group: packageOrReleaseGroupArg,
	};

	private repo: Repository | undefined;

	public async init(): Promise<void> {
		const [, context] = await Promise.all([super.init(), this.getContext()]);
		this.repo = new Repository({ baseDir: context.gitRepo.resolvedRoot });

		// Dynamic imports since these are ESM modules
		// eslint-disable-next-line unicorn/no-await-expression-member
		remark = (await import("remark")).remark;
		// eslint-disable-next-line unicorn/no-await-expression-member
		remarkGfm = (await import("remark-gfm")).default;
		// eslint-disable-next-line unicorn/no-await-expression-member
		remarkGitHub = (await import("remark-github")).default;
	}

	public async run(): Promise<void> {
		const args = this.args;
		const flags = this.flags;
		const context = await this.getContext();

		if (args.package_or_release_group === undefined) {
			this.error("ERROR: Must provide a package or release group.");
		}

		let packageOrReleaseGroup: Package | MonoRepo;
		let changesetsPath: string | undefined;
		if (isReleaseGroup(args.package_or_release_group)) {
			const releaseRepo = context.repo.releaseGroups.get(args.package_or_release_group);
			assert(
				releaseRepo !== undefined,
				`Release repo not found for ${args.package_or_release_group}`,
			);
			packageOrReleaseGroup = releaseRepo;
			changesetsPath = path.join(packageOrReleaseGroup.repoPath, CHANGESET_PATH);
		} else {
			const releasePackage = context.fullPackageMap.get(args.package_or_release_group);
			if (releasePackage === undefined) {
				this.error(`Package not in context: ${releasePackage}`);
			}

			if (releasePackage.monoRepo !== undefined) {
				const rg = releasePackage.monoRepo.kind;
				this.errorLog(`${releasePackage.name} is part of the ${rg} release group.`);
				this.exit(1);
			}
			packageOrReleaseGroup = releasePackage;
			changesetsPath = path.join(packageOrReleaseGroup.directory, CHANGESET_PATH);
		}

		assert(changesetsPath !== undefined, `changesetsPath undefined`);

		const changelogs = new Map<string, string>();
		const filenames = await readdir(changesetsPath);

		for (const filename of filenames.filter(
			(f) => path.extname(f) === ".md" && f !== "README.md",
		)) {
			const changesetFile = path.join(changesetsPath, filename);
			this.info(`Processing ${changesetFile}`);
			const fileContents = readFileSync(changesetFile, "utf-8");
			const parsed = matter(fileContents);

			const changeset: Changeset = {
				file: changesetFile,
				packages: parsed.data,
				rawContent: parsed.content,
			};

			// eslint-disable-next-line no-await-in-loop
			const addedCommit = await this.getChangesetCommit(changeset.file);
			const changeEntry = `${addedCommit.summary}\n\n${parsed.content}`;

			for (const [pkgName, bumpType] of Object.entries(parsed.data)) {
				const changes = changelogs.get(pkgName);
				if (changes === undefined) {
					changelogs.set(pkgName, changeEntry);
				} else {
					changelogs.set(pkgName, `${changes}\n\n${changeEntry}`);
				}
			}
		}

		for (const [pkgName, changelog] of changelogs) {
			const pkg = context.fullPackageMap.get(pkgName);
			if (pkg === undefined) {
				this.warning(`The '${pkgName} package couldn't be found.`);
				continue;
			}

			const changelogPath = path.join(pkg.directory, CHANGELOG_FILENAME);
			let changeLogContents = "";
			if (existsSync(changelogPath)) {
				// eslint-disable-next-line no-await-in-loop
				changeLogContents = await readFile(changelogPath, "utf-8");
			} else {
				changeLogContents += changelog;
			}

			// eslint-disable-next-line no-await-in-loop
			const fileContent = await remark()
				.use(remarkGfm)
				.use(remarkGitHub)
				.process(changeLogContents);

			writeFileSync(changelogPath, String(fileContent));
		}
	}

	public async getChangesetCommit(file: string): Promise<Commit> {
		const results = await this.repo?.gitClient.log({ file });
		if (results === undefined) {
			this.error(`Can't find commit for changeset: ${file}`);
		}

		const last = results.all.slice(-1)[0];
		return { summary: last.message, body: last.body, hash: last.hash };
	}
}
