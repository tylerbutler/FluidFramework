/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { GitRepo, Logger } from "@fluidframework/build-tools";
import { Flags } from "@oclif/core";
import chalk from "chalk";

import { BaseCommand } from "../../base";
import {
	Repository,
	createPullRequest,
	getUserAccess,
	pullRequestExists,
	pullRequestInfo,
} from "../../lib";

interface CommitStatus {
	isConflict: boolean;
	index: number;
}

/**
 * This command class is used to merge two branches based on the batch size provided.
 * It looks for the last common commit between two branches and computes the remaining commits to be merged.
 * Later, it creates a pull request based on the batch size passed.
 */
export default class MergeBranch extends BaseCommand<typeof MergeBranch> {
	static description = "Sync branches depending on the batch size passed";

	static flags = {
		auth: Flags.string({
			description: "GitHub authentication token.",
			char: "a",
			required: true,
			env: "GITHUB_TOKEN",
		}),
		source: Flags.string({
			description: "Source branch name",
			char: "s",
			required: true,
		}),
		target: Flags.string({
			description: "Target branch name",
			char: "t",
			required: true,
		}),
		batchSize: Flags.integer({
			description: "Maximum number of commits to include in the pull request",
			char: "b",
			required: true,
		}),
		...BaseCommand.flags,
	};

	/**
	 * The branch that the command was run from. This is used to checkout the branch in the case of a failure.
	 */
	private initialBranch: string = "";
	/**
	 * A list of branches that should be deleted if the command fails.
	 */
	private readonly branchesToCleanup: string[] = [];

	public async run(): Promise<void> {
		const flags = this.flags;

		const prTitle: string = `Automation: ${flags.source}-${flags.target} integrate`;

		const context = await this.getContext();
		const gitRepo = new Repository({ baseDir: context.gitRepo.resolvedRoot });
		// eslint-disable-next-line unicorn/no-await-expression-member
		this.initialBranch = (await gitRepo.gitClient.status()).current ?? "main";

		// Get the name of the remote that corresponds to the Microsoft fluid repo
		// const remote = gitRepo.getRemote(context.originRemotePartialUrl);
		const remote = "origin";

		const prExists: boolean = await pullRequestExists(flags.auth, prTitle, this.logger);

		if (prExists) {
			this.exit(-1);
			this.error(`Open pull request exists`);
			// TODO: notify the author
		}

		const lastMergedCommit = await gitRepo.getMergeBase(flags.source, flags.target);
		this.log(
			`${lastMergedCommit} is the last merged commit id between ${flags.source} and ${flags.target}`,
		);

		const unmergedCommitList: string[] = await gitRepo.revList(
			lastMergedCommit,
			`refs/remotes/${remote}/${flags.source}`,
		);

		if (unmergedCommitList.length === 0) {
			this.log(
				chalk.green(
					`${flags.source} and ${flags.target} branches are in sync. No commits to merge`,
				),
			);
			this.exit(-1);
		}

		this.log(
			`There are ${unmergedCommitList.length} unmerged commits between ${flags.source} and ${flags.target} branches`,
		);

		const commitSize = Math.min(flags.batchSize, unmergedCommitList.length);
		// `branchToCheckConflicts` is used to check the conflicts of each commit with next.
		const tempBranchToCheckConflicts = `${flags.target}-automation`;
		this.branchesToCleanup.push(tempBranchToCheckConflicts);

		await gitRepo.gitClient.checkoutBranch(tempBranchToCheckConflicts, flags.target);
		// await gitRepo.gitClient.branch([
		// 	"--set-upstream-to",
		// 	`${remote}/${tempBranchToCheckConflicts}`,
		// ]);

		const [commitListHasConflicts, conflictingCommitIndex] = await hasConflicts(
			unmergedCommitList.slice(0, commitSize),
			gitRepo,
			this.logger,
		);
		this.verbose(`conflicting commit: ${conflictingCommitIndex}`);

		/**
		 * The commit that should be used as the HEAD for the PR.
		 */
		let prHeadCommit = "";

		/**
		 * Defaults to true but will be set to false if the PR is expected to not have conflicts.
		 */
		let prWillConflict: boolean;

		if (commitListHasConflicts === true) {
			// There's a conflicting commit in the list, so we need to determine which commit to use as the HEAD for the PR.
			if (conflictingCommitIndex === 0) {
				// If it's the first item in the list that conflicted, then we want to open a single PR with the HEAD at that
				// commit. The PR is expected to conflict with the target branch, so we leave prWillConflict to truethe PR owner will need to merge the branch
				// manually with next and push back to the PR, and then merge once CI passes.
				prHeadCommit = unmergedCommitList[0];
				prWillConflict = true;
			} else {
				// Otherwise, we want to open a PR with the HEAD at the commit BEFORE the first conflicting commit.
				prHeadCommit = unmergedCommitList[conflictingCommitIndex - 1];
				prWillConflict = false;
			}
		} else {
			// No conflicting commits, so set the commit to merge to the last commit in the list.
			prHeadCommit = unmergedCommitList[unmergedCommitList.length - 1];
			prWillConflict = false;
		}

		const branchName = `${flags.source}-${flags.target}-${shortCommit(prHeadCommit)}`;
		this.branchesToCleanup.push(branchName);

		this.verbose(`Creating and checking out branch: ${branchName} at commit ${prHeadCommit}`);
		await gitRepo.gitClient
			.checkoutBranch(branchName, prHeadCommit)
			.push(remote, branchName)
			.branch(["--set-upstream-to", `${remote}/${branchName}`]);

		this.verbose(`Deleting temp branch: ${tempBranchToCheckConflicts}`);
		await gitRepo.gitClient.branch(["-D", tempBranchToCheckConflicts]);

		// this.verbose(`Setting upstream to ${remote} for branch: ${branchName}`);
		// await gitRepo.gitClient.setUpstream(branchName, remote);

		/**
		 * The below description is intended for PRs which has merge conflicts with next.
		 */
		let description: string = `## ${flags.source}-${flags.target} integrate PR
		The aim of this pull request is to sync ${flags.source} and ${flags.target} branch. This commit has **MERGE CONFLICTS** with ${flags.target}. The expectation from the assignee is as follows:

		> - Acknowledge the pull request by adding a comment -- "Actively working on it".

		> - Merge ${flags.target} into this ${branchName}.

		> - Resolve any merge conflicts between ${branchName} and ${flags.target} and push the resolution to this branch: ${branchName}. **Do NOT rebase or squash this branch: its history must be preserved**.

		> - Ensure CI is passing for this PR, fixing any issues.

		> - Recommended git commands:
		git checkout ${branchName}
		git merge ${flags.target}
		**RESOLVE MERGE CONFLICTS**
		git add .
		git commit -m ${prTitle}
		git push`;

		if (prWillConflict === false) {
			await gitRepo.gitClient.merge([flags.target, "-m", prTitle]);

			/**
			 * The below description is intended for PRs which may have CI failures with next.
			 */
			description = `## ${flags.source}-${flags.target} integrate PR
			The aim of this pull request is to sync ${flags.source} and ${flags.target} branch. The expectation from the assignee is as follows:

			> - Acknowledge the pull request by adding a comment -- "Actively working on it".

			> - Resolve any CI failures between ${branchName} and ${flags.target} thereby pushing the resolution to this branch: ${branchName}. **Do NOT rebase or squash this branch: its history must be preserved**.

			> - Ensure CI is passing for this PR, fixing any issues. Please don't look into resolving **Real service e2e test** and **Stress test** failures as they are **non-required** CI failures.

			> - Recommended git commands:
			git checkout ${branchName}
			**FIX THE CI FAILURES**
			git commit --amend -m ${prTitle}
			git push --force-with-lease`;
		}

		/**
		 * fetch name of owner associated to the pull request
		 */
		const pr = await pullRequestInfo(flags.auth, prHeadCommit, this.logger);
		console.debug(pr);
		const author = pr.data?.[0]?.assignee?.login;
		this.info(
			`Fetching pull request info for commit id ${prHeadCommit} and assignee ${author}`,
		);
		const user = await getUserAccess(flags.auth, this.logger);
		this.info(`List users with push access to main branch: ${user}`);

		const prObject = {
			token: flags.auth,
			source: branchName,
			target: flags.target,
			assignee: author,
			title: prTitle,
			description,
		};

		const prNumber = await createPullRequest(prObject, this.logger);
		this.log(
			`Opened pull request ${prNumber} for commit id ${prHeadCommit}. Please resolve the merge conflicts.`,
		);
	}

	protected override async catch(err: Error & { exitCode?: number | undefined }): Promise<any> {
		const context = await this.getContext();
		const gitRepo = context.gitRepo;

		// Check out the initial branch
		this.warning(`CLEANUP: checking out initial branch ${this.initialBranch}`);
		await gitRepo.switchBranch(this.initialBranch);

		// Delete the branches we created
		const promises: Promise<void>[] = [];
		for (const branch of this.branchesToCleanup) {
			this.warning(`CLEANUP: Deleting branch ${branch}`);
			promises.push(gitRepo.deleteBranch(branch));
		}
		await Promise.all(promises);
		throw err;
	}
}

/**
 */

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
export async function hasConflicts(
	commitIds: string[],
	gitRepo: Repository,
	log?: Logger,
): Promise<[boolean, number]> {
	for (const [i, commit] of commitIds.entries()) {
		// eslint-disable-next-line no-await-in-loop
		const mergesClean = await gitRepo.canMergeWithoutConflicts(commit);
		log?.verbose(`Can merge without conflicts ${commit}: ${mergesClean}`);
		if (mergesClean === false) {
			return [true, i];
		}
	}

	// No conflicts found, return the last index
	return [false, commitIds.length - 1];
}

function shortCommit(commit: string): string {
	return commit.slice(0, 7);
}
