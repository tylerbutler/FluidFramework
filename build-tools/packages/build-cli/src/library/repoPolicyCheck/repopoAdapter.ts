/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { resolve as pathResolve } from "node:path";
import {
	type PolicyFailure,
	type PolicyFixResult,
	type PolicyHandler,
	RepoPolicy,
} from "repopo";
import { Handler, readFile } from "./common.js";

export const repopoAdapter = (fluidPolicy: Handler): RepoPolicy => {
	const { name, match, handler: fluidHandler, resolver: fluidResolver } = fluidPolicy;

	const adaptedHandler: PolicyHandler = async ({
		file: repoRelFilePath,
		root,
		resolve: fix,
	}): Promise<true | PolicyFailure | PolicyFixResult> => {
		// fluid handlers expect absolute paths to the file
		const absFilePath = pathResolve(root, repoRelFilePath);
		const result = await fluidHandler(absFilePath, root);
		if (result === undefined) {
			return true;
		}

		if (fix && fluidResolver !== undefined) {
			const resolveResult = await fluidResolver(absFilePath, root);
			if (resolveResult.resolved) {
				const fixResult: PolicyFixResult = {
					name,
					file: repoRelFilePath,
					resolved: true,
					errorMessage: resolveResult.message,
				};
				return fixResult;
			}

			const failResult: PolicyFailure = {
				name,
				file: repoRelFilePath,
				errorMessage: resolveResult.message,
			};
			return failResult;
		}

		return {
			name,
			file: repoRelFilePath,
			errorMessage: result,
		} satisfies PolicyFailure;
	};

	const policy: RepoPolicy = {
		name,
		match,
		handler: adaptedHandler,
	};

	return policy;
};

/**
 * Checks that *.yml/*.yaml files do not use tabs for indentation.
 * Deliberately does not provide a resolver because automatic changes to yaml files, in particular those related to
 * indentation, can be risky.
 */
export const handlerImpl: Handler = {
	name: "indent-with-spaces-in-yaml",
	match: /(^|\/)[^/]+\.ya?ml$/i,
	handler: async (file: string): Promise<string | undefined> => {
		const content = readFile(file);
		return lookForTabs(content);
	},
};

/**
 * Checks for tabs in the indentation of the specified file contents.
 * @remarks Exported only for testing purposes
 * @param fileContents - the file contents to check.
 * @returns an error message if tabs are found; otherwise undefined.
 */
export function lookForTabs(fileContents: string): string | undefined {
	// /m is multiline mode, so ^ matches the start of any line, not just the start of the full string
	// Fail on tabs right at the start of the line, or after whitespace but before any non-whitespace character.
	if (fileContents.search(/^\s*\t/m) !== -1) {
		return errorMessage;
	}
}

/**
 * Exported only for testing purposes.
 */
export const errorMessage = `Tab indentation detected in YAML file. Please use spaces for indentation.`;
