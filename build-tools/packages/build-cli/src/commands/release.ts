/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { VersionBumpType } from "@fluid-tools/version-tools";
import chalk from "chalk";
import { CommandWithChecks } from "../base";
import { packageSelectorFlag, releaseGroupFlag, versionSchemeFlag } from "../flags";
import { bumpReleaseGroup } from "../lib";
import { ReleaseMachine } from "../machines";
import { isReleaseGroup, ReleaseGroup } from "../releaseGroups";

/**
 * Releases a release group recursively.
 *
 * @remarks
 *
 * First the release group's dependencies are checked. If any of the dependencies are also in the repo, then they're
 * checked for the latest release version. If the dependencies have not yet been released, then the command prompts to
 * perform the release of the dependency, then run the releae command again.
 *
 * This process is continued until all the dependencies have been released, after which the release group itself is
 * released.
 */
export default class ReleaseCommand extends CommandWithChecks<typeof ReleaseCommand.flags> {
    static description = "Release a release group and any dependencies.";

    static examples = ["<%= config.bin %> <%= command.id %>"];

    static flags = {
        versionScheme: versionSchemeFlag({
            required: true,
        }),
        releaseGroup: releaseGroupFlag({
            exclusive: ["package"],
            required: false,
        }),
        package: packageSelectorFlag({
            exclusive: ["releaseGroup"],
            required: false,
        }),
        ...CommandWithChecks.flags,
    };

    machine = ReleaseMachine.machine;

    releaseGroup: ReleaseGroup | undefined;
    releaseVersion: string | undefined;
    shouldSkipChecks = false;
    shouldCheckPolicy = true;
    shouldCheckBranch = true;
    shouldCheckBranchUpdate = true;
    shouldCommit = true;

    /** Releases always result in a "patch" bump type after the release. */
    bumpType = "patch" as VersionBumpType;

    checkBranchName(name: string): boolean {
        this.verbose(`Checking if ${name} starts with release/`);
        return name.startsWith("release/");
    }

    get checkBranchNameErrorMessage(): string {
        return `Patch release should only be done on 'release/*' branches, but current branch is '${this._context?.originalBranchName}'.\nYou can skip this check with --no-branchCheck.'`;
    }

    async handleState(state: string): Promise<boolean> {
        const context = await this.getContext();
        let localHandled = true;

        // First handle any states that we know about. If not handled here, we pass it up to the parent handler.
        switch (state) {
            case "DoReleaseGroupBumpPatch": {
                if (!isReleaseGroup(this.releaseGroup)) {
                    this.errorLog(`Expected a release group: ${this.releaseGroup}`);
                    this.machine.action("failure");
                    break;
                }

                const releaseGroupRepo = context.repo.releaseGroups.get(this.releaseGroup)!;
                // Since the release group is released, bump it to the next patch version.
                await bumpReleaseGroup(
                    context,
                    "patch",
                    releaseGroupRepo,
                    this.processedFlags.versionScheme!,
                );
                this.machine.action("success");
                break;
            }

            case "PromptToPRBump": {
                this.logHr();
                this.log(
                    `\nPlease push and create a PR for branch ${await context.gitRepo.getCurrentBranchName()} targeting the ${
                        context.originalBranchName
                    } branch.`,
                );
                this.log(
                    `\nAfter the PR is merged, then the release of ${this.releaseGroup} is complete!`,
                );
                this.exit();
                break;
            }

            case "PromptToPRDeps": {
                const cmd = `${this.config.bin} ${this.id} -g ${this.releaseGroup} -S ${this.processedFlags.versionScheme}`;

                this.logHr();
                this.log(
                    `\nPlease push and create a PR for branch ${await context.gitRepo.getCurrentBranchName()} targeting the ${
                        context.originalBranchName
                    } branch.`,
                );
                this.log(
                    `\nAfter the PR is merged, run the following command to continue the release:`,
                );
                this.logIndent(chalk.whiteBright(`\n${cmd}`));
                this.exit();
                break;
            }

            case "PromptToRelease": {
                const cmd = `${this.config.bin} ${this.id} -g ${this.releaseGroup} -S ${this.processedFlags.versionScheme}`;

                this.logHr();
                this.log(
                    chalk.white(
                        `Please queue a ${chalk.green(
                            "release",
                        )} build for the following release group in ADO for branch ${chalk.blue(
                            context.originalBranchName,
                        )}:`,
                    ),
                );
                this.logIndent(chalk.green(`${this.releaseGroup}`));
                this.log(
                    `\nAfter the build is done and the release group has been published, run the following command to bump the release group to the next version and update dependencies on the newly released package(s):`,
                );
                this.logIndent(chalk.whiteBright(`\n${cmd}`));
                this.exit();
                break;
            }

            default: {
                localHandled = false;
            }
        }

        if (localHandled) {
            return true;
        }

        const superHandled = await super.handleState(state);
        return superHandled;
    }

    async init() {
        await super.init();

        const context = await this.getContext();
        this.releaseGroup = this.processedFlags.releaseGroup!;
        this.releaseVersion = context.repo.releaseGroups.get(this.releaseGroup)!.version;
    }

    async run(): Promise<void> {
        await this.stateLoop();
    }
}
