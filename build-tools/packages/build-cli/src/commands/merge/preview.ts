/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { Logger } from "@fluidframework/build-tools";
import { Flags } from "@oclif/core";
import chalk from "chalk";
import { strict as assert } from "node:assert";

import { BaseCommand } from "../../base";
import { Repository, createPullRequest, getCommitInfo, pullRequestExists } from "../../lib";

interface CleanupBranch {
	branch: string;
	local: boolean;
	remote: boolean;
}

/**
 * This command class is used to merge two branches based on the batch size provided.
 * It looks for the last common commit between two branches and computes the remaining commits to be merged.
 * Later, it creates a pull request based on the batch size passed.
 */
export default class MergeBranch extends BaseCommand<typeof MergeBranch> {
	static description = "Sync branches depending on the batch size passed";

	static flags = {
		// pat: Flags.string({
		// 	description:
		// 		"GitHub Personal Access Token. This parameter should be passed using the GITHUB_PAT environment variable for security purposes.",
		// 	char: "p",
		// 	required: true,
		// 	env: "GITHUB_PAT",
		// }),
		source: Flags.string({
			description: "Source branch name",
			char: "s",
			required: true,
			default: "main",
		}),
		target: Flags.string({
			description: "Target branch name",
			char: "t",
			required: true,
			default: "next",
		}),
		remote: Flags.string({
			description:
				"The name of the upstream remote to use to check for PRs. If not provided, the remote matching the microsoft/FluidFramework repo will be used.",
			char: "r",
		}),
		// createPr: Flags.boolean({
		// 	description: "Use --no-createPr to skip creating a PR. Useful for testing.",
		// 	hidden: true,
		// 	default: true,
		// 	allowNo: true,
		// }),
		// checkPr: Flags.boolean({
		// 	description: "Use --no-checkPr to skip checking for a PR. Useful for testing.",
		// 	hidden: true,
		// 	default: true,
		// 	allowNo: true,
		// }),
		cleanup: Flags.boolean({
			description:
				"Use --no-cleanup to skip cleanup of branches if there's a failure. Useful for testing.",
			hidden: true,
			default: true,
			allowNo: true,
		}),
		...BaseCommand.flags,
	};

	/**
	 * The branch that the command was run from. This is used to checkout the branch in the case of a failure, so the user
	 * is on the starting branch.
	 */
	private initialBranch: string = "";

	/**
	 * A list of local branches that should be deleted if the command fails. The local/remote booleans indicate whether
	 * the branch should be cleaned up locally, remotely, or both.
	 */
	private readonly branchesToCleanup: CleanupBranch[] = [];

	private gitRepo: Repository | undefined;
	private remote: string | undefined;

	public async run(): Promise<void> {
		const flags = this.flags;

		const context = await this.getContext();
		this.gitRepo ??= new Repository({ baseDir: context.gitRepo.resolvedRoot });
		if (this.gitRepo === undefined) {
			this.errorLog(`gitRepo undefined: ${JSON.stringify(this.gitRepo)}`);
			this.error("gitRepo is undefined", { exit: 1 });
		}

		// eslint-disable-next-line unicorn/no-await-expression-member
		this.initialBranch = (await this.gitRepo.gitClient.status()).current ?? "main";

		this.remote =
			flags.remote ?? (await this.gitRepo.getRemote(context.originRemotePartialUrl));
		if (this.remote === undefined) {
			this.error("Remote for upstream repo not found", { exit: 1 });
		}
		this.info(`Remote is: ${this.remote}`);

		const lastMergedCommit = await this.gitRepo.getMergeBase(flags.source, flags.target);
		this.log(
			`${shortCommit(lastMergedCommit)} is the last merged commit id between ${
				flags.source
			} and ${flags.target}`,
		);

		const unmergedCommitList: string[] = await this.gitRepo.revList(
			lastMergedCommit,
			flags.source,
		);

		// sort chronologically; oldest first
		unmergedCommitList.reverse();

		if (unmergedCommitList.length === 0) {
			this.log(chalk.green(`${flags.source} and ${flags.target} branches are in sync.`));
			return;
		}

		this.log(
			`There are ${unmergedCommitList.length} unmerged commits between the ${flags.source} and ${flags.target} branches`,
		);

		/**
		 * tempBranchToCheckConflicts is used to check the conflicts of each commit with the target branch.
		 */
		const tempBranchToCheckConflicts = `${flags.target}-check-conflicts`;

		/**
		 * tempTargetBranch is a local branch created from the target branch. We use this instead of the
		 * target branch itself because the repo might already have a tracking branch for the target and we don't want to
		 * change that.
		 */
		const tempTargetBranch = `${flags.target}-merge-head`;

		// Clean up these branches on failure.
		this.branchesToCleanup.push(
			{
				branch: tempBranchToCheckConflicts,
				local: true,
				remote: false,
			},
			{
				branch: tempTargetBranch,
				local: true,
				remote: false,
			},
		);

		// Check out a new temp branch at the same commit as the target branch.
		await this.gitRepo.gitClient.checkoutBranch(tempBranchToCheckConflicts, flags.target);

		const commitMergeability = await checkConflicts(
			unmergedCommitList,
			this.gitRepo,
			this.logger,
		);

		for (const { commit, mergeability } of commitMergeability) {
			const color =
				mergeability === "clean"
					? chalk.green
					: mergeability === "conflict"
					? chalk.red
					: chalk.yellow;
			this.log(`${commit}\t${color(mergeability)}`);
		}

		await this.doCleanup();
	}

	/**
	 * This method is called when an unhandled exception is thrown, or when the command exits with an error code. if
	 * possible, this code cleans up the temporary branches that were created. It cleans up both local and remote
	 * branches.
	 */
	protected override async catch(err: Error & { exitCode?: number | undefined }): Promise<any> {
		if (this.gitRepo === undefined) {
			throw err;
		}

		if (this.flags.cleanup === true && err.exitCode !== undefined && err.exitCode !== 0) {
			await this.doCleanup();
		}

		return super.catch(err);
	}

	private async doCleanup(): Promise<void> {
		assert(this.gitRepo !== undefined);

		// Check out the initial branch
		this.warning(`CLEANUP: Checking out initial branch ${this.initialBranch}`);
		await this.gitRepo.gitClient.checkout(this.initialBranch);

		// Delete the branches we created
		if (this.branchesToCleanup.length > 0) {
			this.warning(
				`CLEANUP: Deleting local branches: ${this.branchesToCleanup
					.map((b) => b.branch)
					.join(", ")}`,
			);
			await this.gitRepo.gitClient.deleteLocalBranches(
				this.branchesToCleanup.filter((b) => b.local).map((b) => b.branch),
				true /* forceDelete */,
			);
		}

		// Delete any remote branches we created
		const promises: Promise<unknown>[] = [];
		// eslint-disable-next-line unicorn/consistent-function-scoping
		const deleteFunc = async (branch: string) => {
			this.warning(`CLEANUP: Deleting remote branch ${this.remote}/${branch}`);
			try {
				await this.gitRepo?.gitClient.push(this.remote, branch, ["--delete"]);
			} catch {
				this.verbose(`CLEANUP: FAILED to delete remote branch ${this.remote}/${branch}`);
			}
		};
		for (const branch of this.branchesToCleanup.filter((b) => b.remote)) {
			promises.push(deleteFunc(branch.branch));
		}
		await Promise.all(promises);
	}
}

/**
 * Function always returns an index in the array. The Boolean indicates whether the commit at that index conflicts or
 * not. If the Boolean is false, then you know that all commits in the list are mergable. If the Boolean is true, then
 * it indicates that the indexed commit conflicts. The primary role of the function is to check a list of commits for
 * conflicts, and if there is one, to return the index of the conflict.
 *
 * @param commitIds - An array of commit ids to check for conflicts.
 * @param gitRepo - The git repository to check for conflicts in.
 * @param log - An optional logger to use.
 * @returns a Boolean that indicates whether the commit at that index conflicts or not
 */
async function checkConflicts(
	commitIds: string[],
	gitRepo: Repository,
	log?: Logger,
): Promise<{ commit: string; mergeability: "clean" | "conflict" | "maybeClean" }[]> {
	const results: { commit: string; mergeability: "clean" | "conflict" | "maybeClean" }[] = [];
	for (const commit of commitIds) {
		// eslint-disable-next-line no-await-in-loop
		const mergesClean = await gitRepo.canMergeWithoutConflicts(commit);
		log?.verbose(`Can merge without conflicts ${commit}: ${mergesClean}`);
		if (mergesClean === true) {
			results.push({ commit, mergeability: "clean" });
		} else {
			// eslint-disable-next-line no-await-in-loop
			const cherryPicksClean = await gitRepo.canCherryPickWithoutConflicts(commit);
			if (cherryPicksClean === true) {
				results.push({ commit, mergeability: "maybeClean" });
			} else {
				results.push({ commit, mergeability: "conflict" });
			}
		}
	}

	return results;
}

function shortCommit(commit: string): string {
	return commit.slice(0, 7);
}
