/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import fs from "node:fs";
import path from "node:path";

import {
	checkPackageCompatLayerGeneration,
	DEFAULT_GENERATION_DIR,
	DEFAULT_GENERATION_FILE_NAME,
	DEFAULT_MINIMUM_COMPAT_WINDOW_MONTHS,
} from "../compatLayerGeneration.js";
import type { Handler } from "./common.js";

/**
 * A policy handler that checks whether packages with `fluidCompatMetadata` in their
 * `package.json` have up-to-date compat layer generation files.
 *
 * This handler runs as part of `check policy`, which means it will be checked in CI
 * automatically. Previously, this check only ran during `flub release` and
 * `flub release prepare`.
 *
 * The handler is opt-in: packages without `fluidCompatMetadata` are skipped silently
 * unless they have an orphaned generation file.
 */
export const handler: Handler = {
	name: "compat-layer-generation",
	match: /(^|\/)package\.json$/i,
	handler: async (file: string, root: string): Promise<string | undefined> => {
		const content = fs.readFileSync(file, { encoding: "utf8" });
		let packageJson: {
			name?: string;
			version?: string;
			fluidCompatMetadata?: {
				generation: number;
				releaseDate: string;
				releasePkgVersion: string;
			};
		};

		try {
			packageJson = JSON.parse(content);
		} catch {
			// Not valid JSON; skip this file silently since other handlers catch JSON issues.
			return undefined;
		}

		const version = packageJson.version;
		if (version === undefined) {
			// No version field; this isn't a publishable package, skip it.
			return undefined;
		}

		const directory = path.dirname(file);

		const result = await checkPackageCompatLayerGeneration(
			{
				version,
				packageJson,
				directory,
			},
			DEFAULT_GENERATION_DIR,
			DEFAULT_GENERATION_FILE_NAME,
			DEFAULT_MINIMUM_COMPAT_WINDOW_MONTHS,
		);

		if (result.needsUpdate) {
			return `Compat layer generation is out of date for ${packageJson.name ?? file}: ${result.reason}. Run 'pnpm flub generate compatLayerGeneration' to update.`;
		}

		if (result.needsDeletion) {
			return `Orphaned compat layer generation file found for ${packageJson.name ?? file}: ${result.reason}. Delete '${result.filePath}' to fix.`;
		}

		return undefined;
	},
};
