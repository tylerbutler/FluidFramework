/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { PackageName as PackageNameApi, StringBuilder } from "@rushstack/node-core-library";
import chalk from "chalk";

import type { PackageName, ReleaseGroupName } from "@fluid-tools/build-infrastructure";
// eslint-disable-next-line import/no-deprecated
import { type Context, MonoRepoKind, indentString } from "./library/index.js";
import { CommandLogger } from "./logging.js";
import { ReleaseGroup, ReleasePackage } from "./releaseGroups.js";

/**
 * An instructional prompt to display to a user in a terminal. A prompt can have any number of sections, and each
 * section is meant to be shown sequentially to provide step-by-step instructions.
 */
export interface InstructionalPrompt {
	/**
	 * The title of the prompt.
	 */
	title: string;

	/**
	 * An array of sections that comprise the prompt.
	 */
	sections: Section[];
}

/**
 * A section of an {@link InstructionalPrompt}.
 */
interface Section {
	/**
	 * The title of the section.
	 */
	title: string;

	/**
	 * The instructional message to be displayed in the section.
	 */
	message: string;

	/**
	 * An optional command string that will be displayed with the instructions.
	 */
	cmd?: string;
}

/**
 *
 * Returns ADO pipeline link for the releaseGroup
 */
export const mapADOLinks = (
	context: Context,
	releaseGroup: ReleaseGroupName | PackageName | undefined,
): string | undefined => {
	if (releaseGroup === undefined) {
		return undefined;
	}
	const name = PackageNameApi.getUnscopedName(releaseGroup) as ReleaseGroupName;
	const rg = context.repo.releaseGroups.get(name);
	return rg?.adoPipelineUrl;
};

/**
 * An abstract base class for classes that write {@link InstructionalPrompt}s to the terminal.
 */
export abstract class InstructionalPromptWriter {
	protected abstract get log(): CommandLogger;

	public async formatPrompt(data: InstructionalPrompt): Promise<string> {
		const b = new StringBuilder();

		b.append(chalk.green(chalk.underline(data.title)));
		b.append("\n");
		b.append("\n");

		for (const section of data.sections) {
			b.append(chalk.white(chalk.underline(`${section.title}:`)));
			b.append("\n");
			b.append("\n");
			b.append(indentString(section.message, 4));
			b.append("\n");
			b.append("\n");
			if (section.cmd !== undefined) {
				b.append(indentString(chalk.cyan(`${section.cmd}`), 4));
				b.append("\n");
				b.append("\n");
			}
		}

		return b.toString();
	}

	/**
	 * Writes the prompt to the terminal.
	 */
	public async writePrompt(data: InstructionalPrompt): Promise<void> {
		const prompt = await this.formatPrompt(data);

		this.log.logHr();
		this.log.log("");
		this.log.log(prompt);
	}
}

/**
 * A simple concrete implementation of {@link InstructionalPromptWriter}.
 */
export class PromptWriter extends InstructionalPromptWriter {
	public constructor(public log: CommandLogger) {
		super();
	}
}
