/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "assert";
import {
    Context,
    FluidRepo,
    getResolvedFluidRoot,
    GitRepo,
    Logger,
    Package,
} from "@fluidframework/build-tools";
import { Command, Flags } from "@oclif/core";
import {
    bumpVersionScheme,
    detectVersionScheme,
    VersionBumpType,
} from "@fluid-tools/version-tools";
// eslint-disable-next-line import/no-internal-modules
import { FlagInput, OutputFlags, ParserOutput } from "@oclif/core/lib/interfaces";
import chalk from "chalk";
import type { Machine } from "jssm";
import {
    ChecksBranchName,
    ChecksBranchUpdate,
    CheckSkipper,
    ChecksPolicy,
    ChecksShouldCommit,
    ChecksValidReleaseGroup,
} from "./checks";
import { checkFlags, rootPathFlag, skipCheckFlag } from "./flags";
import {
    bumpDepsBranchName,
    createBumpBranch,
    difference,
    getPreReleaseDependencies,
    isReleased,
    npmCheckUpdates,
    releaseBranchName,
} from "./lib";
import { StateHandler } from "./machines";
import { isReleaseGroup, ReleaseGroup } from "./releaseGroups";

// This is needed to get type safety working in derived classes.
// https://github.com/oclif/oclif.github.io/pull/142
export type InferredFlagsType<T> = T extends FlagInput<infer F>
    ? F & { json: boolean | undefined }
    : any;

/**
 * A base command that sets up common flags that all commands should have. All commands should have this class in their
 * inheritance chain.
 */
export abstract class BaseCommand<T extends typeof BaseCommand.flags> extends Command {
    static flags = {
        root: rootPathFlag(),
        timer: Flags.boolean({
            default: false,
            hidden: true,
        }),
        verbose: Flags.boolean({
            char: "v",
            description: "Verbose logging.",
            required: false,
        }),
    };

    protected parsedOutput?: ParserOutput<any, any>;

    /** The processed arguments that were passed to the CLI. */
    get processedArgs(): { [name: string]: any } {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.parsedOutput?.args ?? {};
    }

    /** The processed flags that were passed to the CLI. */
    get processedFlags(): InferredFlagsType<T> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.parsedOutput?.flags ?? {};
    }

    /** The flags defined on the base class. */
    private get baseFlags() {
        return this.processedFlags as Partial<OutputFlags<typeof BaseCommand.flags>>;
    }

    protected _context: Context | undefined;
    private _logger: Logger | undefined;

    async init() {
        this.parsedOutput = await this.parse(this.ctor);
    }

    async catch(err: any) {
        // add any custom logic to handle errors from the command
        // or simply return the parent class error handling
        return super.catch(err);
    }

    async finally(err: any) {
        // called after run and catch regardless of whether or not the command errored
        return super.finally(err);
    }

    /**
     * The repo {@link Context}. The context is retrieved and cached the first time this method is called. Subsequent
     * calls will return the cached context.
     *
     * @returns The repo {@link Context}.
     */
    async getContext(): Promise<Context> {
        if (this._context === undefined) {
            const resolvedRoot = await getResolvedFluidRoot();
            const gitRepo = new GitRepo(resolvedRoot);
            const branch = await gitRepo.getCurrentBranchName();

            this.verbose(`Repo: ${resolvedRoot}`);
            this.verbose(`Branch: ${branch}`);

            this._context = new Context(
                gitRepo,
                "github.com/microsoft/FluidFramework",
                branch,
                this.logger,
            );
        }

        return this._context;
    }

    /**
     * @returns A default logger that can be passed to core functions enabling them to log using the command logging
     * system */
    protected get logger(): Logger {
        if (this._logger === undefined) {
            this._logger = {
                info: (msg: string | Error) => {
                    this.log(msg.toString());
                },
                warning: this.warning.bind(this),
                error: (msg: string | Error) => {
                    this.error(msg);
                },
                verbose: (msg: string | Error) => {
                    this.verbose(msg);
                },
            };
        }

        return this._logger;
    }


    /** Output a horizontal rule. */
    public logHr() {
        this.log("=".repeat(72));
    }

    /** Log a message with an indent. */
    public logIndent(input: string, indent = 2) {
        this.log(`${this.indent(indent)}${input}`);
    }

    public indent(indent = 2): string {
        return " ".repeat(indent);
    }

    public errorLog(message: string | Error) {
        this.log(chalk.red(`ERROR: ${message}`));
    }

    public warning(message: string | Error): string | Error {
        this.log(chalk.yellow(`WARNING: ${message}`));
        return message;
    }

    public verbose(message: string | Error): string | Error {
        if (this.baseFlags.verbose === true) {
            if (typeof message === "string") {
                this.log(chalk.grey(`VERBOSE: ${message}`));
            } else {
                this.log(chalk.red(`VERBOSE: ${message}`));
            }
        }

        return message;
    }
}

/**
 * A base command that uses an internal state machine to govern its behavior.
 */
export abstract class StateMachineCommand<T extends typeof StateMachineCommand.flags>
    extends BaseCommand<T>
    implements StateHandler {
    static flags = {
        ...BaseCommand.flags,
    };

    abstract get machine(): Machine<unknown>;

    async init(): Promise<void> {
        await super.init();
        await this.initMachineHooks();
    }

    /** Wires up some hooks on the machine to do logging */
    protected async initMachineHooks() {
        for (const state of this.machine.states()) {
            if (this.machine.state_is_terminal(state)) {
                this.machine.hook_entry(state, (o: any) => {
                    const { from, action } = o;
                    this.verbose(`${state}: ${action} from ${from}`);
                });
            }
        }

        this.machine.hook_any_transition((t: any) => {
            const { action, from, to } = t;
            this.verbose(`STATE MACHINE: ${from} [${action}] ==> ${to}`);
        });
    }

    async handleState(state: string): Promise<boolean> {
        switch (state) {
            case "Failed": {
                this.verbose("Failed state!");
                this.exit();
                return true;
            }

            default: {
                return false;
            }
        }
    }

    /** Loops over the state machine and calls handleState for each machine state. Subclasses should call this at the
     * end of their `run` method. */
    protected async stateLoop(): Promise<void> {
        do {
            const state = this.machine.state();
            // eslint-disable-next-line no-await-in-loop
            const handled = await this.handleState(state);
            if (!handled) {
                this.error(`Unhandled state: ${state}`);
            }
            // eslint-disable-next-line no-constant-condition
        } while (true);
    }

    async run(): Promise<void> {
        await this.stateLoop();
    }
}

/**
 * A state-machine-based command that includes default handlers for most of the "Check" states.
 */
export abstract class CommandWithChecks<T extends typeof CommandWithChecks.flags>
    extends StateMachineCommand<T>
    implements
    ChecksValidReleaseGroup,
    ChecksPolicy,
    ChecksBranchName,
    ChecksBranchUpdate,
    ChecksShouldCommit,
    CheckSkipper {
    static flags = {
        skipChecks: skipCheckFlag,
        ...checkFlags,
        ...StateMachineCommand.flags,
    };

    abstract get shouldSkipChecks(): boolean;
    abstract set shouldSkipChecks(v: boolean);
    abstract get shouldCheckBranch(): boolean;
    abstract set shouldCheckBranch(v: boolean);
    abstract get shouldCommit(): boolean;
    abstract set shouldCommit(v: boolean);
    abstract get shouldCheckPolicy(): boolean;
    abstract set shouldCheckPolicy(v: boolean);
    abstract get shouldCheckBranchUpdate(): boolean;
    abstract set shouldCheckBranchUpdate(v: boolean);

    abstract get releaseGroup(): ReleaseGroup | undefined;
    abstract set releaseGroup(v: ReleaseGroup | undefined);
    abstract get releaseVersion(): string | undefined;
    abstract set releaseVersion(v: string | undefined);
    abstract get bumpType(): VersionBumpType;
    abstract set bumpType(v: VersionBumpType);

    abstract checkBranchName(name: string): boolean;

    get checkBranchNameErrorMessage() {
        return `Branch name '${this._context?.originalBranchName}' isn't expected. You can skip this check with --no-branchCheck.`;
    }

    async init() {
        await super.init();
        await this.initMachineHooks();
        const flags = this.processedFlags;

        this.shouldSkipChecks = flags.skipChecks;
        this.shouldCheckPolicy = flags.policyCheck && !flags.skipChecks;
        this.shouldCheckBranch = flags.branchCheck && !flags.skipChecks;
        this.shouldCommit = flags.commit && !flags.skipChecks;
        this.shouldCheckBranchUpdate = flags.updateCheck && !flags.skipChecks;
    }

    protected async initMachineHooks() {
        await super.initMachineHooks();
        this.machine.hook_exit("Init", (o: any) => {
            const { action } = o;
            if (action === "failure") {
                this.warning(`Skipping ALL CHECKS! Be sure you know what you are doing!`);
            }
        });
    }

    // eslint-disable-next-line complexity
    async handleState(state: string): Promise<boolean> {
        const context = await this.getContext();
        let localHandled = true;

        // First handle any states that we know about. If not handled here, we pass it up to the parent handler.
        switch (state) {
            case "Init": {
                this.machine.action("success");
                break;
            }

            case "CheckShouldRunChecks": {
                if (this.shouldSkipChecks) {
                    this.machine.action("failure");
                }

                this.machine.action("success");
                break;
            }

            case "CheckValidReleaseGroup": {
                if (isReleaseGroup(this.releaseGroup)) {
                    this.machine.action("success");
                } else {
                    this.machine.action("failure");
                }

                break;
            }

            case "CheckPolicy": {
                // TODO: run policy check before releasing a version.
                if (this.shouldCheckPolicy) {
                    this.warning(chalk.red(`Automated policy check not yet implemented.`));
                    this.warning(`Run policy check manually and check in all fixes.`);
                    // await runPolicyCheckWithFix(context);
                } else {
                    this.warning("Skipping policy check.");
                }

                this.machine.action("success");
                break;
            }

            case "CheckBranchName": {
                if (this.shouldCheckBranch) {
                    if (!this.checkBranchName(context.originalBranchName)) {
                        this.errorLog(this.checkBranchNameErrorMessage);
                        this.machine.action("failure");
                    }
                } else {
                    this.warning(
                        `Not checking if current branch is a release branch: ${context.originalBranchName}`,
                    );
                }

                this.machine.action("success");
                break;
            }

            case "CheckHasRemote": {
                const remote = await context.gitRepo.getRemote(context.originRemotePartialUrl);
                if (remote === undefined) {
                    this.machine.action("failure");
                    this.errorLog(`Unable to find remote for '${context.originRemotePartialUrl}'`);
                }

                this.machine.action("success");
                break;
            }

            case "CheckBranchUpToDate": {
                const remote = await context.gitRepo.getRemote(context.originRemotePartialUrl);
                const isBranchUpToDate = await context.gitRepo.isBranchUpToDate(
                    context.originalBranchName,
                    remote!,
                );
                if (this.shouldCheckBranchUpdate) {
                    if (!isBranchUpToDate) {
                        this.machine.action("failure");
                        this.errorLog(
                            `Local '${context.originalBranchName}' branch not up to date with remote. Please pull from '${remote}'.`,
                        );
                    }

                    this.machine.action("success");
                } else {
                    this.warning("Not checking if the branch is up-to-date with the remote.");
                    this.machine.action("success");
                }

                break;
            }

            case "CheckNoMorePrereleaseDependencies":
            case "CheckNoPrereleaseDependencies2":
            case "CheckNoPrereleaseDependencies": {
                const { releaseGroups, packages, isEmpty } = await getPreReleaseDependencies(
                    context,
                    this.releaseGroup!,
                );

                // assert(!isEmpty, `No prereleases found in ${state} state.`);

                const packagesToBump = new Set(packages);
                for (const rg of releaseGroups) {
                    for (const p of context.packagesInReleaseGroup(rg)) {
                        packagesToBump.add(p.name);
                    }
                }

                if (isEmpty) {
                    this.machine.action("success");
                } else {
                    this.machine.action("failure");
                }

                break;
            }

            // case "CheckNoPrereleaseDependencies2":
            case "DoBumpReleasedDependencies": {
                const { releaseGroups, packages, isEmpty } = await getPreReleaseDependencies(
                    context,
                    this.releaseGroup!,
                );

                assert(!isEmpty, `No prereleases found in DoBumpReleasedDependencies state.`);

                const packagesToBump = new Set(packages);
                for (const rg of releaseGroups) {
                    for (const p of context.packagesInReleaseGroup(rg)) {
                        packagesToBump.add(p.name);
                    }
                }

                // First, check if any prereleases have released versions on npm
                let { updatedPackages, updatedDependencies } = await npmCheckUpdates(
                    context,
                    this.releaseGroup!,
                    [...packagesToBump],
                    "current",
                    /* prerelease */ true,
                    /* writeChanges */ false,
                    this.logger,
                );

                // Divide the updated dependencies into individual packages and release groups
                const updatedReleaseGroups = new Set<string>();
                const updatedDeps = new Set<string>();
                for (const p of updatedDependencies) {
                    if (p.monoRepo === undefined) {
                        updatedDeps.add(p.name);
                    } else {
                        updatedReleaseGroups.add(p.monoRepo.kind);
                    }
                }

                const remainingReleaseGroupsToBump = difference(
                    new Set(releaseGroups.map((rg) => rg.toString())),
                    updatedReleaseGroups,
                );
                const remainingPackagesToBump = difference(new Set(packages), updatedDeps);

                if (remainingReleaseGroupsToBump.size === 0 && remainingPackagesToBump.size === 0) {
                    // This is the same command as run above, but this time we write the changes. THere are more
                    // efficient ways to do this but this is simple.
                    ({ updatedPackages, updatedDependencies } = await npmCheckUpdates(
                        context,
                        this.releaseGroup!,
                        [...packagesToBump],
                        "current",
                        /* prerelease */ true,
                        /* writeChanges */ true,
                    ));
                }

                if (updatedPackages.length > 0) {
                    // There were updates, which is considered a failure.
                    this.machine.action("failure");
                    context.repo.reload();
                    break;
                }

                // if (await FluidRepo.ensureInstalled(updatedPackages)) {
                // } else {
                //     this.errorLog("Install failed.");
                //     this.machine.force_transition("Failed");
                // }
                this.machine.action("success");
                break;
            }

            case "CheckReleaseBranchDoesNotExist": {
                const releaseBranch = releaseBranchName(this.releaseGroup!, this.releaseVersion!);

                const commit = await context.gitRepo.getShaForBranch(releaseBranch);
                if (commit !== undefined) {
                    this.machine.action("failure");
                    this.errorLog(`${releaseBranch} already exists`);
                }

                this.machine.action("success");
                break;
            }

            case "CheckIfCurrentReleaseGroupIsReleased": {
                const wasReleased = await isReleased(context, this.releaseGroup!);
                if (wasReleased) {
                    this.machine.action("success");
                } else {
                    this.machine.action("failure");
                }

                break;
            }

            case "CheckShouldCommitBump":
            case "CheckShouldCommitDeps": {
                if (!this.shouldCommit) {
                    this.machine.action("failure");
                    break;
                }

                assert(isReleaseGroup(this.releaseGroup));
                const version = context.repo.releaseGroups.get(this.releaseGroup)!.version;
                const scheme = detectVersionScheme(version);
                const newVersion = bumpVersionScheme(version, this.bumpType, scheme);
                const bumpBranchName = await createBumpBranch(
                    context,
                    this.releaseGroup,
                    this.bumpType,
                );

                this.verbose(`Created bump branch: ${bumpBranchName}`);

                const commitMsg = `[bump] ${this.releaseGroup}: ${version} => ${newVersion} (${this.bumpType})`;
                await context.gitRepo.commit(commitMsg, `Error committing to ${bumpBranchName}`);
                this.machine.action("success");
                break;
            }

            case "CheckShouldCommitReleasedDepsBump": {
                if (!this.shouldCommit) {
                    this.machine.action("success");
                }

                assert(isReleaseGroup(this.releaseGroup));
                const branchName = bumpDepsBranchName(this.releaseGroup, "releasedDeps");
                await context.gitRepo.createBranch(branchName);

                this.verbose(`Created bump branch: ${branchName}`);
                this.log(
                    `BUMP: ${this.releaseGroup}: Bumped prerelease dependencies to release versions.`,
                );

                const commitMsg = `[bump] ${this.releaseGroup}: update prerelease dependencies to release versions`;
                await context.gitRepo.commit(commitMsg, `Error committing to ${branchName}`);
                this.machine.action("success");
                break;
            }

            case "PromptToCommitBump": {
                this.log(
                    `Commit the local changes and create a PR targeting the ${context.originalBranchName} branch.`,
                );
                this.log(
                    `\nAfter the PR is merged, then the release of ${this.releaseGroup} is complete!`,
                );
                this.exit();
                break;
            }

            case "PromptToCommitDeps":
            case "PromptToCommitReleasedDepsBump": {
                this.log(
                    `Commit the local changes and create a PR targeting the ${context.originalBranchName} branch.`,
                );
                this.exit();
                break;
            }

            case "PromptToReleaseDeps": {
                const prereleaseDepNames = await getPreReleaseDependencies(
                    context,
                    this.releaseGroup!,
                );

                if (
                    prereleaseDepNames.releaseGroups.length > 0 ||
                    prereleaseDepNames.packages.length > 0
                ) {
                    this.logHr();
                    this.log(
                        chalk.red(
                            `\nCan't release the ${this.releaseGroup} release group because some of its dependencies need to be released first.`,
                        ),
                    );

                    if (prereleaseDepNames.packages.length > 0) {
                        this.log(
                            `\nRelease these packages from the '${context.originalBranchName}' branch:`,
                        );
                        for (const p of prereleaseDepNames.packages) {
                            this.logIndent(chalk.blue(`${p}`));
                        }
                    }

                    if (prereleaseDepNames.releaseGroups.length > 0) {
                        this.log(
                            `\nRelease these release groups from the '${context.originalBranchName}' branch:`,
                        );
                        for (const p of prereleaseDepNames.releaseGroups) {
                            this.logIndent(chalk.blueBright(`${p}`));
                        }
                    }
                }

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
}
