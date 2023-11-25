#!/usr/bin/env node
/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

async function main() {
	const { execute } = await import("@oclif/core");
	await execute({ dir: import.meta.url });
}

await main();
