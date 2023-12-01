/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { FluidRepo } from "../common/fluidRepo";
import { GitRepo } from "./gitRepo";

/**
 * Context provides access to data about the Fluid repo, and exposes methods to interrogate the repo state.
 *
 * @internal
 */
export class Context {
	public readonly repo: FluidRepo;

	constructor(
		public readonly gitRepo: GitRepo,
		public readonly originRemotePartialUrl: string,
		public readonly originalBranchName: string,
	) {
		// this.timer = new Timer(commonOptions.timer);

		// Load the package
		this.repo = new FluidRepo(this.gitRepo.resolvedRoot);
		// this.timer.time("Package scan completed");
	}
}
