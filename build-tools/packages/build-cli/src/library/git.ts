/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import path from "node:path";
import {
	type IFluidRepo,
	type IPackage,
	type IReleaseGroup,
	type PackageName,
	type ReleaseGroupName,
	isIReleaseGroup,
} from "@fluid-tools/build-infrastructure";
import { type IFluidBuildPackage } from "@fluidframework/build-tools";
import { PackageName as PackageScope } from "@rushstack/node-core-library";
import { parseISO } from "date-fns";
import readPkgUp from "read-pkg-up";
import * as semver from "semver";
import { SimpleGit, SimpleGitOptions, simpleGit } from "simple-git";
import type { SetRequired } from "type-fest";

import { CommandLogger } from "../logging.js";
import { ReleaseGroup } from "../releaseGroups.js";
import { Context } from "./context.js";
import type { VersionDetails } from "./release.js";
/**
 * Default options passed to the git client.
 */
const defaultGitOptions: Partial<SimpleGitOptions> = {
	binary: "git",
	maxConcurrentProcesses: 6,
	trimmed: true,
};

/**
 * A small wrapper around a git repo to provide API access to it.
 *
 * @remarks
 *
 * Eventually this should replace the legacy GitRepo class in build-tools. That class exec's git commands directly,
 * while this class uses a library wrapper around git where possible instead. Note that git is still called "directly" via the `raw` API.
 *
 * @deprecated Use SimpleGit directly or, when needed, the free functions in this module.
 */
export class Repository {
	private readonly git: SimpleGit;
	private readonly baseDir: string;

	/**
	 * A git client for the repository that can be used to call git directly.
	 */
	public get gitClient(): SimpleGit {
		return this.git;
	}

	constructor(
		gitOptions: SetRequired<Partial<SimpleGitOptions>, "baseDir">,
		protected readonly log?: CommandLogger,
	) {
		const options: SetRequired<Partial<SimpleGitOptions>, "baseDir"> = {
			...gitOptions,
			...defaultGitOptions,
		};
		log?.verbose("gitOptions:");
		log?.verbose(JSON.stringify(options));
		this.baseDir = options.baseDir;
		this.git = simpleGit(options);
	}

	/**
	 * Returns the SHA hash for a branch. If a remote is provided, the SHA for the remote ref is returned.
	 */
	public async getShaForBranch(branch: string, remote?: string): Promise<string> {
		const refspec =
			remote === undefined ? `refs/heads/${branch}` : `refs/remotes/${remote}/${branch}`;
		const result = await this.git.raw(`show-ref`, refspec);

		return result;
	}

	/**
	 * Get the remote based on the partial Url. It will match the first remote that contains the partialUrl case
	 * insensitively.
	 *
	 * @param partialUrl - partial url to match case insensitively
	 */
	public async getRemote(partialUrl: string): Promise<string | undefined> {
		const lowerPartialUrl = partialUrl.toLowerCase();
		const remotes = await this.git.getRemotes(/* verbose */ true);

		for (const r of remotes) {
			if (r.refs.fetch.toLowerCase().includes(lowerPartialUrl)) {
				return r.name;
			}
		}
	}

	/**
	 * Get the merge base between the current HEAD and the remote branch.
	 *
	 * @param branch - The branch to compare against.
	 * @param remote - The remote to compare against.
	 * @param localRef - The local ref to compare against. Defaults to HEAD.
	 * @returns The ref of the merge base between the current HEAD and the remote branch.
	 */
	public async getMergeBaseRemote(
		branch: string,
		remote: string,
		localRef = "HEAD",
	): Promise<string> {
		const base = await this.gitClient
			.fetch([remote]) // make sure we have the latest remote refs
			.raw("merge-base", `refs/remotes/${remote}/${branch}`, localRef);
		return base;
	}

	/**
	 * Get the merge base between two refs.
	 *
	 * @param ref1 - The first ref to compare.
	 * @param ref2 - The ref to compare against.
	 * @returns The ref of the merge base between the two refs.
	 */
	public async getMergeBase(ref1: string, ref2: string): Promise<string> {
		const base = await this.gitClient.raw("merge-base", `${ref1}`, ref2);
		return base;
	}

	private async getChangedFilesSinceRef(ref: string, remote: string): Promise<string[]> {
		const divergedAt = await this.getMergeBaseRemote(ref, remote);
		// Now we can find which files we added
		const added = await this.gitClient
			.fetch(["--all"]) // make sure we have the latest remote refs
			.diff(["--name-only", "--diff-filter=d", divergedAt]);

		const files = added
			.split("\n")
			.filter((value) => value !== null && value !== undefined && value !== "");
		return files;
	}

	private async getChangedDirectoriesSinceRef(ref: string, remote: string): Promise<string[]> {
		const files = await this.getChangedFilesSinceRef(ref, remote);
		const dirs = new Set(files.map((f) => path.dirname(f)));
		return [...dirs];
	}

	/**
	 * Gets the changed files, directories, release groups, and packages since the given ref.
	 *
	 * @param ref - The ref to compare against.
	 * @param remote - The remote to compare against.
	 * @param context - The Context.
	 * @returns An object containing the changed files, directories, release groups, and packages. The groups may overlap.
	 * That is, if a single package in a release group is changed, the releaseGroups value will contain that group, and
	 * the packages value will contain only the single package. Also, if two packages are changed, one within a release
	 * group and one independent, the packages value will contain both packages.
	 */
	public async getChangedSinceRef(
		ref: string,
		remote: string,
		context: Context,
	): Promise<{
		files: string[];
		dirs: string[];
		releaseGroups: ReleaseGroup[];
		packages: IPackage[];
	}> {
		const files = await this.getChangedFilesSinceRef(ref, remote);
		const dirs = await this.getChangedDirectoriesSinceRef(ref, remote);

		const changedPackageNames = dirs
			.map((dir) => {
				const cwd = path.resolve(context.repo.resolvedRoot, dir);
				return readPkgUp.sync({ cwd })?.packageJson.name;
			})
			.filter((name): name is string => name !== undefined);

		const changedPackages = [...new Set(changedPackageNames)]
			.map((name) => context.fullPackageMap.get(name))
			.filter((pkg): pkg is IFluidBuildPackage => pkg !== undefined);

		const changedReleaseGroups = [
			...new Set(changedPackages.map((pkg) => pkg.monoRepo?.kind)),
		].filter((rg): rg is ReleaseGroup => rg !== undefined);

		return {
			files,
			dirs,
			releaseGroups: changedReleaseGroups,
			packages: changedPackages,
		};
	}

	/**
	 * Calls `git rev-list` to get all commits between the base and head commits.
	 *
	 * @param baseCommit - The base commit.
	 * @param headCommit - The head commit. Defaults to HEAD.
	 * @returns An array of all commits between the base and head commits.
	 */
	public async revList(baseCommit: string, headCommit: string = "HEAD"): Promise<string[]> {
		const result = await this.git.raw("rev-list", `${baseCommit}..${headCommit}`, "--reverse");
		return result
			.split(/\r?\n/)
			.filter((value) => value !== null && value !== undefined && value !== "");
	}

	public async canMergeWithoutConflicts(commit: string): Promise<boolean> {
		let mergeResult;
		try {
			console.log(`Checking merge conflicts for: ${commit}`);
			mergeResult = await this.git.merge([commit, "--no-commit", "--no-ff"]);
			await this.git.merge(["--abort"]);
		} catch {
			console.log(`Merge conflicts exists for: ${commit}`);
			await this.git.merge(["--abort"]);
			return false;
		}

		return mergeResult.result === "success";
	}

	/**
	 * Returns an array containing repo repo-relative paths to all the files in the provided directory.
	 * A given path will only be included once in the array; that is, there will be no duplicate paths.
	 * Note that this function excludes files that are deleted locally whether the deletion is staged or not.
	 *
	 * @param directory - A directory to filter the results by. Only files under this directory will be returned. To
	 * return all files in the repo use the value `"."`.
	 */
	public async getFiles(directory: string): Promise<string[]> {
		// Note that `--deduplicate` is not used here because it is not available until git version 2.31.0.
		const results = await this.gitClient.raw(
			"ls-files",
			// Includes cached (staged) files.
			"--cached",
			// Includes other (untracked) files that are not ignored.
			"--others",
			// Excludes files that are ignored by standard ignore rules.
			"--exclude-standard",
			// Shows the full path of the files relative to the repository root.
			"--full-name",
			directory,
		);

		// Deduplicate the list of files by building a Set.
		// This includes paths to deleted, unstaged files, so we get the list of deleted files from git status and remove
		// those from the full list.
		const allFiles = new Set(
			results
				.split("\n")
				.map((line) => line.trim())
				// filter out empty lines
				.filter((line) => line !== ""),
		);
		const status = await this.gitClient.status();
		for (const deletedFile of status.deleted) {
			allFiles.delete(deletedFile);
		}

		// Files are already repo root-relative
		return [...allFiles];
	}
}

const _versions: Map<ReleaseGroupName | PackageName, VersionDetails[]> = new Map();

/**
 * Gets all the versions for a release group or independent package. This function only considers the tags in the
 * repo to determine releases and dates.
 *
 * @param releaseGroupOrPackageName - The release group or package to get versions for.
 * @returns An array of {@link ReleaseDetails} containing the version and date for each version.
 */
export async function getAllVersions(
	releaseGroupOrPackageName: ReleaseGroupName | PackageName,
	repo: IFluidRepo,
): Promise<VersionDetails[] | undefined> {
	// Try to get the git repo immediately so that if we're outside a repo, we throw immediately.
	const gitRepo = await repo.getGitRepository();

	const cacheEntry = _versions.get(releaseGroupOrPackageName);
	if (cacheEntry !== undefined) {
		return cacheEntry;
	}
	const maybeReleaseGroup = repo.releaseGroups.get(
		releaseGroupOrPackageName as ReleaseGroupName,
	);
	const releaseGroupOrPackage =
		maybeReleaseGroup ?? repo.packages.get(releaseGroupOrPackageName as PackageName);

	if (releaseGroupOrPackage === undefined) {
		throw new Error(`Release group or package not found: ${releaseGroupOrPackageName}`);
	}

	/**
	 * A map of version strings to the date that version was released.
	 */
	const versions = new Map<string, Date>();
	const tags = await getTagsForReleaseGroup(releaseGroupOrPackage, gitRepo);

	for (const tag of tags) {
		const ver = getVersionFromTag(tag);
		if (ver !== undefined && ver !== "" && ver !== null) {
			// eslint-disable-next-line no-await-in-loop
			const date = await getCommitDate(gitRepo, tag);
			versions.set(ver, date);
		}
	}

	if (versions.size === 0) {
		return undefined;
	}

	const toReturn: VersionDetails[] = [];
	for (const [version, date] of versions) {
		toReturn.push({ version, date });
	}

	_versions.set(releaseGroupOrPackageName, toReturn);
	return toReturn;
}

const _tags: Map<string, string[]> = new Map();

/**
 * Returns an array of all the git tags associated with a release group or package.
 *
 * @param releaseGroupOrPackage - The release group or package to get tags for.
 * @returns An array of all all the tags for the release group or package.
 */
async function getTagsForReleaseGroup(
	releaseGroupOrPackage: IReleaseGroup | IPackage,
	git: SimpleGit,
): Promise<string[]> {
	const prefix = isIReleaseGroup(releaseGroupOrPackage)
		? releaseGroupOrPackage.name.toLowerCase()
		: PackageScope.getUnscopedName(releaseGroupOrPackage.name);

	const cacheEntry = _tags.get(prefix);
	if (cacheEntry !== undefined) {
		return cacheEntry;
	}

	const tagList = await getAllTags(git, `${prefix}_v*`);
	return tagList;
}

/**
 * Get all tags matching a pattern.
 *
 * @param git - A SimpleGit instance to use to retrieve git tags.
 * @param pattern - Pattern of tags to get.
 */
async function getAllTags(git: SimpleGit, pattern?: string): Promise<string[]> {
	const results =
		pattern === undefined || pattern.length === 0
			? await git.raw(`tag -l --sort=-committerdate`)
			: await git.raw(`tag -l "${pattern}" --sort=-committerdate`);
	const tags = results.split("\n").filter(
		// Remove any empty entries
		(t) => t !== undefined && t !== "" && t !== null,
	);

	return tags;
}

/**
 * Gets the date of a git commit.
 *
 * @param gitRef - A reference to a git commit/tag/branch for which the commit date will be parsed.
 * @returns The commit date of the ref.
 */
async function getCommitDate(git: SimpleGit, gitRef: string): Promise<Date> {
	const result = await git.raw(`show -s --format=%cI "${gitRef}"`);
	const date = parseISO(result);
	return date;
}

/**
 * Parses the version from a git tag.
 *
 * @param tag - The tag.
 * @returns The version string, or undefined if one could not be found.
 *
 * @privateRemarks
 * TODO: Duplicate code in version-tools/src/schemes.ts
 */
export function getVersionFromTag(tag: string): string | undefined {
	// This is sufficient, but there is a possibility that this will fail if we add a tag that includes "_v" in its
	// name.
	const tagSplit = tag.split("_v");
	if (tagSplit.length !== 2) {
		return undefined;
	}

	const ver = semver.parse(tagSplit[1]);
	if (ver === null) {
		return undefined;
	}

	return ver.version;
}

/**
 * Returns an array containing repo repo-relative paths to all the files in the provided directory.
 * A given path will only be included once in the array; that is, there will be no duplicate paths.
 * Note that this function excludes files that are deleted locally whether the deletion is staged or not.
 *
 * @param directory - A directory to filter the results by. Only files under this directory will be returned. To
 * return all files in the repo use the value `"."`.
 */
export async function getFiles(directory: string, git: SimpleGit): Promise<string[]> {
	// Note that `--deduplicate` is not used here because it is not available until git version 2.31.0.
	const results = await git.raw(
		"ls-files",
		// Includes cached (staged) files.
		"--cached",
		// Includes other (untracked) files that are not ignored.
		"--others",
		// Excludes files that are ignored by standard ignore rules.
		"--exclude-standard",
		// Shows the full path of the files relative to the repository root.
		"--full-name",
		directory,
	);

	// Deduplicate the list of files by building a Set.
	// This includes paths to deleted, unstaged files, so we get the list of deleted files from git status and remove
	// those from the full list.
	const allFiles = new Set(
		results
			.split("\n")
			.map((line) => line.trim())
			// filter out empty lines
			.filter((line) => line !== ""),
	);
	const status = await git.status();
	for (const deletedFile of status.deleted) {
		allFiles.delete(deletedFile);
	}

	// Files are already repo root-relative
	return [...allFiles];
}
