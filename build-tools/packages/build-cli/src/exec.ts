/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import * as child_process from "node:child_process";
import * as path from "node:path";

export interface ExecAsyncResult {
	error: child_process.ExecException | null;
	stdout: string;
	stderr: string;
}

export async function execAsync(
	command: string,
	options: child_process.ExecOptions,
	pipeStdIn?: string,
): Promise<ExecAsyncResult> {
	return new Promise((resolve, reject) => {
		const p = child_process.exec(command, options, (error, stdout, stderr) => {
			resolve({ error, stdout, stderr });
		});

		if (pipeStdIn !== undefined && p.stdin) {
			p.stdin.write(pipeStdIn);
			p.stdin.end();
		}
	});
}

export async function execWithErrorAsync(
	command: string,
	options: child_process.ExecOptions,
	errorPrefix: string,
	// eslint-disable-next-line default-param-last
	warning: boolean = true,
	pipeStdIn?: string,
): Promise<ExecAsyncResult> {
	const ret = await execAsync(command, options, pipeStdIn);
	printExecError(ret, command, errorPrefix, warning);
	return ret;
}

async function rimrafAsync(deletePath: string) {
	return execAsync(`rimraf "${deletePath}"`, {
		env: {
			// eslint-disable-next-line @typescript-eslint/dot-notation
			PATH: `${process.env["PATH"]}${path.delimiter}${path.join(
				// eslint-disable-next-line unicorn/prefer-module
				__dirname,
				"..",
				"..",
				"node_modules",
				".bin",
			)}`,
		},
	});
}

export async function rimrafWithErrorAsync(deletePath: string, errorPrefix: string) {
	const ret = await rimrafAsync(deletePath);
	printExecError(ret, `rimraf ${deletePath}`, errorPrefix, true);
	return ret;
}

function printExecError(
	ret: ExecAsyncResult,
	command: string,
	errorPrefix: string,
	warning: boolean,
) {
	if (ret.error) {
		console.error(`${errorPrefix}: error during command ${command}`);
		console.error(`${errorPrefix}: ${ret.error.message}`);
		console.error(
			ret.stdout
				? `${errorPrefix}: ${ret.stdout}\n${ret.stderr}`
				: `${errorPrefix}: ${ret.stderr}`,
		);
	} else if (warning && ret.stderr) {
		// no error code but still error messages, treat them is non fatal warnings
		console.warn(`${errorPrefix}: warning during command ${command}`);
		console.warn(`${errorPrefix}: ${ret.stderr}`);
	}
}
