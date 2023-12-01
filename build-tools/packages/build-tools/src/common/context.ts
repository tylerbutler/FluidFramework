/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { FluidRepo } from "../common/fluidRepo";
import { getResolvedFluidRoot } from "./fluidUtils";
import { GitRepo } from "./gitRepo";

export class FluidRepoContext {
	public readonly repo: FluidRepo;

	constructor(
		public readonly repoRoot: string,
		public readonly gitRepo: GitRepo,
		public readonly upstreamGitHubRepoName: string,
		public readonly startingBranchName: string,
	) {
		this.repo = new FluidRepo(repoRoot);
	}

	public static async InitializeContext(
		upstreamGitHubRepoName: string,
	): Promise<FluidRepoContext> {
		const resolvedRoot = await getResolvedFluidRoot();
		const gitRepo = new GitRepo(resolvedRoot);
		const branch = await gitRepo.getCurrentBranchName();
		return new FluidRepoContext(resolvedRoot, gitRepo, upstreamGitHubRepoName, branch);
	}
}
