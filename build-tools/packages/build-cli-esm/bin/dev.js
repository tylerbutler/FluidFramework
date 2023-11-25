#!/usr/bin/env -S node --loader ts-node/esm --no-warnings=ExperimentalWarning
/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

// eslint-disable-next-line node/shebang
async function main() {
	const { execute } = await import("@oclif/core");
	await execute({ development: true, dir: import.meta.url });
}

await main();
