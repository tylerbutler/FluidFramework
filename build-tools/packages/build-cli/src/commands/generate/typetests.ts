/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { Flags } from "@oclif/core";
import { Listr, ListrBaseClassOptions, ListrTask, Manager } from "listr2";

import { generateTests, getAndUpdatePackageDetails } from "@fluidframework/build-tools";

import { BaseCommand } from "../../base";
import { releaseGroupFlag } from "../../flags";

function chunk<T>(array: T[], chunkSize: number): T[][] {
    const res: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const chunk = array.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

interface TaskContext {
    name?: string;
}

function TaskManagerFactory<T = any>(override?: ListrBaseClassOptions): Manager<T> {
    const defaultOptions: ListrBaseClassOptions = {
        concurrent: true,
        exitOnError: false,
        rendererOptions: {
            showTimer: true,
        },
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return new Manager({ ...defaultOptions, ...override });
}

export default class GenerateTypeTestsCommand extends BaseCommand<
    typeof GenerateTypeTestsCommand.flags
> {
    static summary =
        "Generates type tests based on the individual package settings in package.json.";

    static description = `Generating type tests has two parts: preparing package.json and generating type tests. By default, both steps are run for each package. This can be overridden using the --prepare and --generate flags.`;

    static flags = {
        dir: Flags.directory({
            char: "d",
            description: "Run on the package in this directory.",
            exclusive: ["packages", "releaseGroup"],
        }),
        packages: Flags.boolean({
            description: "Run on all independent packages in the repo.",
            default: false,
            exclusive: ["dir", "releaseGroup"],
        }),
        releaseGroup: releaseGroupFlag({
            description: "Run on all packages within this release group.",
            exclusive: ["dir", "packages"],
        }),
        prepare: Flags.boolean({
            description:
                "Prepares the package.json only. Doesn't generate tests. Note that npm install may need to be run after preparation.",
            exclusive: ["generate"],
        }),
        generate: Flags.boolean({
            description: "Generates tests only. Doesn't prepare the package.json.",
            exclusive: ["prepare"],
        }),
        versionConstraint: Flags.string({
            char: "s",
            exclusive: ["generate"],
            options: [
                "^previousMajor",
                "^previousMinor",
                "~previousMajor",
                "~previousMinor",
                "previousMajor",
                "previousMinor",
            ],
        }),
        exact: Flags.string({
            exclusive: ["generate", "versionConstraint"],
        }),
        ...BaseCommand.flags,
    };

    static examples = [
        {
            description: "",
            command: "<%= config.bin %> <%= command.id %>",
        },
    ];

    // eslint-disable-next-line new-cap
    private readonly tasks = TaskManagerFactory<TaskContext>();

    public async run(): Promise<void> {
        const flags = this.processedFlags;

        if (
            flags.dir === undefined &&
            flags.releaseGroup === undefined &&
            (flags.packages ?? false) === false
        ) {
            this.error(`Must provide a --dir, --packages, or --releaseGroup argument.`);
        }

        const releaseGroup = flags.releaseGroup;
        const independentPackages = flags.packages;
        const dir = flags.dir;

        const runPrepare =
            flags.prepare === undefined && flags.generate === undefined
                ? true
                : flags.prepare ?? false;
        const runGenerate =
            flags.prepare === undefined && flags.generate === undefined
                ? true
                : flags.generate ?? false;

        this.logHr();
        this.log(`prepareOnly: ${runPrepare}, ${flags.prepare}`);
        this.log(`generateOnly: ${runGenerate}, ${flags.generate}`);
        this.logHr();

        // const releaseGroupRepo =
        //     releaseGroup === undefined ? undefined : context.repo.releaseGroups.get(releaseGroup);

        const packageDirs: string[] = [];
        // eslint-disable-next-line no-negated-condition
        if (dir !== undefined) {
            this.info(`Finding package in directory: ${dir}`);
            packageDirs.push(dir);
        } else {
            const context = await this.getContext();
            if (independentPackages) {
                this.info(`Finding independent packages`);
                packageDirs.push(...context.independentPackages.map((p) => p.directory));
            } else if (releaseGroup !== undefined) {
                this.info(`Finding packages for release group: ${releaseGroup}`);
                packageDirs.push(
                    ...context.packagesInReleaseGroup(releaseGroup).map((p) => p.directory),
                );
            }
        }

        // if (!flags.verbose) {
        //     CliUx.ux.action.start("Preparing/generating type tests...", "generating", {
        //         stdout: true,
        //     });
        // }

        // const pkgs = this.tasks.add([])

        const output: string[] = [];
        const _tasks: ListrTask[] = [];
        const _tmp = [...packageDirs];
        const chunkSize = 30;
        for (const [i, entries] of chunk(_tmp, chunkSize).entries()) {
            // this.warning(JSON.stringify(entries));
            for (const [j, packageDir] of entries.entries()) {
                const packageName = packageDir.slice(Math.max(0, packageDir.lastIndexOf("/") + 1));
                const title = `${i + j * chunkSize + 1}/${packageDirs.length}: ${packageName}`;

                _tasks.push({
                    title,
                    task: async (ctx, task): Promise<boolean> => {
                        try {
                            const start = Date.now();
                            const packageData = await getAndUpdatePackageDetails(
                                packageDir,
                                /* writeUpdates */ runPrepare,
                                flags.versionConstraint as any,
                                flags.exact,
                                this.logger,
                            ).finally(() => {
                                task.output = `Loaded(${Date.now() - start}ms)`;
                            });

                            if (packageData.skipReason !== undefined) {
                                task.skip(`${title}: ${packageData.skipReason}`);
                            } else if (runGenerate === true && packageData.oldVersions.length > 0) {
                                // eslint-disable-next-line @typescript-eslint/no-shadow
                                const start = Date.now();
                                this.log(`Generating tests for ${packageData.pkg.name}`);
                                await generateTests(packageData)
                                    .then((s) => {
                                        task.output = `dirs(${s.dirs}) files(${s.files}) tests(${s.tests})`;
                                    })
                                    .finally(() => {
                                        task.output = `Generated(${Date.now() - start}ms)`;
                                    });
                            }
                            task.output = "Done.";
                            return true;
                        } catch {
                            return false;
                        } finally {
                            // this.verbose(output.join(": "));
                        }
                    },
                });
            }

            this.tasks.add([
                {
                    title: `Group ${i}`,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    task: (ctx, task): Listr => task.newListr(_tasks),
                },
            ]);
            // eslint-disable-next-line no-await-in-loop
            await this.tasks.runAll();
        }

        // this.tasks.add([{
        //     title: "Generate",
        //     task: async () => true,
        // },
        // this.tasks.indent(_tasks),
        // ]);

        try {
            await this.tasks.runAll();
        } catch (error: any) {
            this.error(error);
        }

        // eslint-disable-next-line unicorn/no-await-expression-member
        // const results = (await Promise.all(runningGenerates)).every((v) => v);

        // if (!flags.verbose) {
        //     CliUx.ux.action.stop("Done");
        // }

        // if (!results) {
        //     this.error(`Some type test generation failed.`);
        // }
    }
}
