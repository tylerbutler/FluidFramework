/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Package, Packages } from "./npmPackage";
import * as path from "path";
import { execWithErrorAsync, rimrafWithErrorAsync, existsSync, readJsonSync } from "./utils";

export enum MonoRepoKind {
    Client,
    Server,
};

export class MonoRepo {
    public readonly packages: Package[] = [];
    public readonly version: string;
    constructor(public readonly kind: MonoRepoKind, public readonly repoPath: string) {
        const lernaPath = path.join(repoPath, "lerna.json");
        if (!existsSync(lernaPath)) {
            throw new Error(`ERROR: lerna.json not found in ${repoPath}`);
        }
        const lerna = readJsonSync(lernaPath);
        if (lerna.packages) {
            for (const dir of lerna.packages as string[]) {
                // TODO: other glob pattern?
                const loadDir = dir.endsWith("/**") ? dir.substr(0, dir.length - 3) : dir;
                this.packages.push(...Packages.loadDir(path.join(this.repoPath, loadDir), MonoRepoKind[kind], this));
            }
        } else {
            // look for workspaces in package.json
            this.packages.push(...this.loadWorkspaces(repoPath));
        }
        this.version = lerna.version;
    }

    private loadWorkspaces(packagePath: string): Package[] {
        const pkgPath = path.join(this.repoPath, "package.json");
        const pkg = readJsonSync(pkgPath);
        const packages: Package[] = [];
        for (const dir of pkg.workspaces) {
            if (dir.endsWith("/")) {
                // ignore these for now
                // this.packages.push(...this.loadWorkspaces(dir.substr(0, dir.length - 1)));
            }
            else if (dir.endsWith("/**") || dir.endsWith("*/*")) {
                const loadDir = dir.substr(0, dir.length - 3);
                return Packages.loadDir(path.join(this.repoPath, loadDir), MonoRepoKind[this.kind], this);
            }
        }
        return [];
    }

    public static isSame(a: MonoRepo | undefined, b: MonoRepo | undefined) {
        return a !== undefined && a === b;
    }

    public getNodeModulePath() {
        return path.join(this.repoPath, "node_modules");
    }

    public async install() {
        console.log(`${MonoRepoKind[this.kind]}: Installing - npm i`);
        const installScript = "npm i";
        return execWithErrorAsync(installScript, { cwd: this.repoPath }, this.repoPath);
    }
    public async uninstall() {
        return rimrafWithErrorAsync(this.getNodeModulePath(), this.repoPath);
    }
};
