/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { program } from "@commander-js/extra-typings";
import colors from "picocolors";

import { getAllDependenciesInRepo, loadFluidRepo } from "../fluidRepo.js";

program
	// .command("list")
	// .argument("[file]")
	.option("--cwd <searchPath>", "Path to a Fluid repo", process.cwd())
	.action(({ cwd }) => {
		// load the fluid repo
		const repo = loadFluidRepo(cwd);

		logIndent(colors.underline("Repository layout"));
		for (const workspace of repo.workspaces.values()) {
			logIndent(colors.blue(workspace.toString()), 1);
			for (const releaseGroup of workspace.releaseGroups.values()) {
				logIndent(colors.green(releaseGroup.toString()), 2);
				// console.log();
				logIndent("Packages", 3);
				for (const pkg of releaseGroup.packages) {
					const pkgMessage = colors.white(
						`${pkg.name}${pkg.isReleaseGroupRoot ? colors.bold(" (root)") : ""}`,
					);
					logIndent(pkgMessage, 4);
				}

				const { releaseGroups, workspaces } = getAllDependenciesInRepo(
					repo,
					releaseGroup.packages,
				);
				console.log();
				logIndent("Depends on:", 3);
				for (const depReleaseGroup of releaseGroups) {
					logIndent(depReleaseGroup.toString(), 4);
				}
				for (const depWorkspace of workspaces) {
					logIndent(depWorkspace.toString(), 4);
				}
			}
		}
	});

program.parse();

function logIndent(message: string, indent: number = 0): void {
	const spaces = " ".repeat(2 * indent);
	console.log(`${spaces}${message}`);
}
