/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { queue } from "async";

import { options } from "../fluidBuild/options";
import { defaultLogger } from "./logging";
import { Package, MonoRepo } from "@fluidframework/build-tools";
import {
	ExecAsyncResult,
	execWithErrorAsync,
	existsSync,
	isSameFileOrDir,
} from "./utils";

const { log } = defaultLogger;


interface TaskExec<TItem, TResult> {
	item: TItem;
	resolve: (result: TResult) => void;
	reject: (reason?: any) => void;
}

async function queueExec<TItem, TResult>(
	items: Iterable<TItem>,
	exec: (item: TItem) => Promise<TResult>,
	messageCallback?: (item: TItem) => string,
) {
	let numDone = 0;
	const timedExec = messageCallback
		? async (item: TItem) => {
				const startTime = Date.now();
				const result = await exec(item);
				const elapsedTime = (Date.now() - startTime) / 1000;
				log(
					`[${++numDone}/${p.length}] ${messageCallback(item)} - ${elapsedTime.toFixed(3)}s`,
				);
				return result;
			}
		: exec;
	const q = queue(async (taskExec: TaskExec<TItem, TResult>) => {
		try {
			taskExec.resolve(await timedExec(taskExec.item));
		} catch (e) {
			taskExec.reject(e);
		}
	}, options.concurrency);
	const p: Promise<TResult>[] = [];
	for (const item of items) {
		p.push(new Promise<TResult>((resolve, reject) => q.push({ item, resolve, reject })));
	}
	return Promise.all(p);
}

export class Packages {
	public constructor(public readonly packages: Package[]) {}

	public static loadDir(
		dirFullPath: string,
		group: string,
		ignoredDirFullPaths: string[] | undefined,
		monoRepo?: MonoRepo,
	) {
		const packageJsonFileName = path.join(dirFullPath, "package.json");
		if (existsSync(packageJsonFileName)) {
			return [Package.load(packageJsonFileName, group, monoRepo)];
		}

		const packages: Package[] = [];
		const files = fs.readdirSync(dirFullPath, { withFileTypes: true });
		files.map((dirent) => {
			if (dirent.isDirectory() && dirent.name !== "node_modules") {
				const fullPath = path.join(dirFullPath, dirent.name);
				if (
					ignoredDirFullPaths === undefined ||
					!ignoredDirFullPaths.some((name) => isSameFileOrDir(name, fullPath))
				) {
					packages.push(...Packages.loadDir(fullPath, group, ignoredDirFullPaths, monoRepo));
				}
			}
		});
		return packages;
	}

	public async cleanNodeModules() {
		return this.queueExecOnAllPackage((pkg) => pkg.cleanNodeModules(), "rimraf node_modules");
	}

	public async forEachAsync<TResult>(
		exec: (pkg: Package) => Promise<TResult>,
		parallel: boolean,
		message?: string,
	) {
		if (parallel) {
			return this.queueExecOnAllPackageCore(exec, message);
		}

		const results: TResult[] = [];
		for (const pkg of this.packages) {
			results.push(await exec(pkg));
		}
		return results;
	}

	public static async clean(packages: Package[], status: boolean) {
		const cleanP: Promise<ExecAsyncResult>[] = [];
		let numDone = 0;
		const execCleanScript = async (pkg: Package, cleanScript: string) => {
			const startTime = Date.now();
			const result = await execWithErrorAsync(
				cleanScript,
				{
					cwd: pkg.directory,
					env: {
						PATH: `${process.env["PATH"]}${path.delimiter}${path.join(
							pkg.directory,
							"node_modules",
							".bin",
						)}`,
					},
				},
				pkg.nameColored,
			);

			if (status) {
				const elapsedTime = (Date.now() - startTime) / 1000;
				log(
					`[${++numDone}/${cleanP.length}] ${
						pkg.nameColored
					}: ${cleanScript} - ${elapsedTime.toFixed(3)}s`,
				);
			}
			return result;
		};
		for (const pkg of packages) {
			const cleanScript = pkg.getScript("clean");
			if (cleanScript) {
				cleanP.push(execCleanScript(pkg, cleanScript));
			}
		}
		const results = await Promise.all(cleanP);
		return !results.some((result) => result.error);
	}

	private async queueExecOnAllPackageCore<TResult>(
		exec: (pkg: Package) => Promise<TResult>,
		message?: string,
	) {
		const messageCallback = message
			? (pkg: Package) => ` ${pkg.nameColored}: ${message}`
			: undefined;
		return queueExec(this.packages, exec, messageCallback);
	}

	private async queueExecOnAllPackage(
		exec: (pkg: Package) => Promise<ExecAsyncResult>,
		message?: string,
	) {
		const results = await this.queueExecOnAllPackageCore(exec, message);
		return !results.some((result) => result.error);
	}
}
