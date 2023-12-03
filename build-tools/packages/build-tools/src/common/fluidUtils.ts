/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import * as childProcess from "node:child_process";
import * as path from "node:path";
import { existsSync } from "node:fs";
import { cosmiconfigSync } from "cosmiconfig";
import findUp from "find-up";
import { readJsonSync, realpathSync } from "fs-extra";

import { commonOptions } from "./commonOptions";
import { IFluidBuildConfig } from "./fluidRepo";

import registerDebug from "debug";
const traceInit = registerDebug("fluid-build:init");

function isFluidRootPackage(dir: string) {
	const filename = path.join(dir, "package.json");
	if (!existsSync(filename)) {
		traceInit(`InferRoot: package.json not found`);
		return false;
	}

	const parsed = readJsonSync(filename);
	if (parsed.private === true) {
		return true;
	}
	traceInit(`InferRoot: package.json not matched`);
	return false;
}

function inferRoot(): string | undefined {
	let fluidConfig = findUp.sync("fluidBuild.config.cjs", { cwd: process.cwd(), type: "file" });
	if (fluidConfig === undefined) {
		traceInit(`No fluidBuild.config.cjs found. Falling back to git root.`);
		// Use the git root as a fallback for older branches where the fluidBuild config is still in
		// package.json
		const gitRoot = childProcess
			.execSync("git rev-parse --show-toplevel", { encoding: "utf8" })
			.trim();
		fluidConfig = path.join(gitRoot, "package.json");
		if (fluidConfig === undefined || !existsSync(fluidConfig)) {
			return undefined;
		}
	}
	const isRoot = isFluidRootPackage(path.dirname(fluidConfig));
	if (isRoot) {
		return path.dirname(fluidConfig);
	}

	return undefined;
}

export function getResolvedFluidRoot() {
	let checkFluidRoot = true;
	let root = commonOptions.root;
	if (root) {
		traceInit(`Using argument root @ ${root}`);
	} else {
		root = inferRoot();
		if (root) {
			checkFluidRoot = false;
			traceInit(`Using inferred root @ ${root}`);
		} else if (commonOptions.defaultRoot) {
			root = commonOptions.defaultRoot;
			traceInit(`Using default root @ ${root}`);
		} else {
			throw new Error(
				`Unknown repo root. Specify it with --root or environment variable _FLUID_ROOT_`,
			);
		}
	}

	if (checkFluidRoot && !isFluidRootPackage(root)) {
		throw new Error(`'${root}' is not a root of Fluid repo.`);
	}

	const resolvedRoot = path.resolve(root);
	if (!existsSync(resolvedRoot)) {
		throw new Error(`Repo root '${resolvedRoot}' does not exist.`);
	}

	// Use realpath.native to get the case-sensitive path on windows
	return realpathSync(resolvedRoot);
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
export function getFluidBuildConfig(rootDir?: string, noCache = false): IFluidBuildConfig {
	if (noCache === true) {
		configExplorer.clearCaches();
	}

	const searchDir = rootDir ?? getResolvedFluidRoot();

	const config = configExplorer.search(searchDir);
	if (config?.config === undefined) {
		throw new Error(`Error loading config.`);
	}
	return config.config;
}
