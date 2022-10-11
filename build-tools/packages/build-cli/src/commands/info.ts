/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { Flags } from "@oclif/core";
import { table } from "table";

import { BaseCommand } from "../base";
import { releaseGroupFlag } from "../flags";
import { ReleaseGroup, isReleaseGroup } from "../releaseGroups";

/**
 * The root `info` command.
 */
export default class InfoCommand extends BaseCommand<typeof InfoCommand.flags> {
    static description = "Get info about the repo, release groups, and packages.";

    static flags = {
        releaseGroup: releaseGroupFlag({
            required: false,
        }),
        private: Flags.boolean({
            allowNo: true,
            char: "p",
            default: true,
            description: "Include private packages (default true).",
            required: false,
        }),
        ...BaseCommand.flags,
    };

    async run(): Promise<void> {
        const flags = this.processedFlags;
        const context = await this.getContext();
        let packages =
            flags.releaseGroup !== undefined && isReleaseGroup(flags.releaseGroup)
                ? context.packagesInReleaseGroup(flags.releaseGroup)
                : [...context.fullPackageMap.values()];

        // Filter out private packages
        if (!flags.private) {
            packages = packages.filter((p) => !p.packageJson.private);
        }

        const data: (string | ReleaseGroup | undefined)[][] = [
            ["Release group", "Name", "Private", "Version"],
        ];
        for (const pkg of packages) {
            data.push([
                pkg.monoRepo?.kind ?? "n/a",
                pkg.name,
                pkg.packageJson.private ? "-private-" : "",
                pkg.monoRepo ? pkg.monoRepo.version : pkg.version,
            ]);
        }

        const output = table(data, {
            columns: [{ alignment: "left" }, { alignment: "left" }, { alignment: "center" }],
            singleLine: true,
        });

        this.log(`\n${output}`);
        this.log(`Total package count: ${packages.length}`);
    }
}
