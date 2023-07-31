/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { readJson } from "fs-extra";
import * as childProcess from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";
import { promisify } from "node:util";
// import * as fsp from "node:fs/promises";
import { cosmiconfigSync } from "cosmiconfig";
import findUp from "find-up";

import { IFluidBuildConfig } from "./fluidRepo";
import { Logger, defaultLogger } from "./logging";

const realpathAsync = promisify(fs.realpath.native);

async function isFluidRootLerna(dir: string, log: Logger = defaultLogger) {
	const filename = path.join(dir, "lerna.json");
	if (!fs.existsSync(filename)) {
		log.verbose(`InferRoot: lerna.json not found`);
		return false;
	}
	const rootPackageManifest = getFluidBuildConfig(dir);
	if (
		rootPackageManifest.repoPackages.server !== undefined &&
		!fs.existsSync(
			path.join(dir, rootPackageManifest.repoPackages.server as string, "lerna.json"),
		)
	) {
		log.verbose(
			`InferRoot: ${dir}/${
				rootPackageManifest.repoPackages.server as string
			}/lerna.json not found`,
		);
		return false;
	}

	return true;
}

async function isFluidRootPackage(dir: string, log: Logger = defaultLogger) {
	const filename = path.join(dir, "package.json");
	if (!fs.existsSync(filename)) {
		log.verbose(`InferRoot: package.json not found`);
		return false;
	}

	const parsed = await readJson(filename);
	if (parsed.name === "root" && parsed.private === true) {
		return true;
	}
	log.verbose(`InferRoot: package.json not matched`);
	return false;
}

async function isFluidRoot(dir: string) {
	// eslint-disable-next-line no-return-await
	return (await isFluidRootLerna(dir)) && (await isFluidRootPackage(dir));
}

async function inferRoot(log: Logger = defaultLogger) {
	let fluidConfig = findUp.sync("fluidBuild.config.cjs", { cwd: process.cwd(), type: "file" });
	if (fluidConfig === undefined) {
		log?.verbose(`No fluidBuild.config.cjs found. Falling back to git root.`);
		// Use the git root as a fallback for older branches where the fluidBuild config is still in
		// package.json
		const gitRoot = childProcess
			.execSync("git rev-parse --show-toplevel", { encoding: "utf8" })
			.trim();
		fluidConfig = path.join(gitRoot, "package.json");
		if (fluidConfig === undefined || !fs.existsSync(fluidConfig)) {
			return;
		}
	}
	const isRoot = await isFluidRootPackage(path.dirname(fluidConfig), log);
	if (isRoot) {
		return path.dirname(fluidConfig);
	}
}

export async function getResolvedFluidRoot(log: Logger = defaultLogger) {
	let checkFluidRoot = true;
	const root = await inferRoot(log);
	if (root === undefined) {
		log.errorLog(
			`Unknown repo root. Specify it with --root or environment variable _FLUID_ROOT_`,
		);
		throw new Error(`Unknown repo root.`);
	} else {
		checkFluidRoot = false;
		log.verbose(`Using inferred root @ ${root}`);
	}

	const isRoot = await isFluidRoot(root);
	if (checkFluidRoot && isRoot) {
		log.errorLog(`'${root}' is not a root of Fluid repo.`);
		throw new Error(`'${root}' is not a root of Fluid repo.`);
	}

	const resolvedRoot = path.resolve(root);
	if (!fs.existsSync(resolvedRoot)) {
		log.errorLog(`Repo root '${resolvedRoot}' does not exist.`);
		throw new Error(`Repo root '${resolvedRoot}' does not exist.`);
	}

	// Use realpath.native to get the case-sensitive path on windows
	// eslint-disable-next-line no-return-await
	return await realpathAsync(resolvedRoot);
}

/**
 * A cosmiconfig explorer to find the fluidBuild config. First looks for javascript config files and falls back to the
 * fluidBuild propert in package.json. We create a single explorer here because cosmiconfig internally caches configs
 * for performance. The cache is per-explorer, so re-using the same explorer is a minor perf improvement.
 */
const configExplorer = cosmiconfigSync("fluidBuild", {
	searchPlaces: [`fluidBuild.config.cjs`, `fluidBuild.config.js`, "package.json"],
	packageProp: "fluidBuild",
});

/**
 * Loads an IFluidBuildConfig from the fluidBuild property in a package.json file, or from fluidBuild.config.[c]js.
 *
 * @param rootDir - The path to the root package.json to load.
 * @param noCache - If true, the config cache will be cleared and the config will be reloaded.
 * @returns The fluidBuild section of the package.json.
 */
export function getFluidBuildConfig(rootDir: string, noCache = false): IFluidBuildConfig {
	if (noCache === true) {
		configExplorer.clearCaches();
	}

	const config = configExplorer.search(rootDir);
	if (config?.config === undefined) {
		throw new Error(`Error loading config.`);
	}
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return config.config;
}
