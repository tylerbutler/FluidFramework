/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "assert";
// import * as path from "node:path";

// import { type PackageJson } from "../interfaces.js";
import { loadFluidRepo } from "../fluidRepo.js";
// import { testDataPath } from "./init.js";

describe("loadFluidRepo", () => {
	it("loads correctly", () => {
		const repo = loadFluidRepo();
		assert.strictEqual(
			repo.workspaces.size,
			"4",
			`Expected 4 workspaces, found ${repo.workspaces.size}`,
		);
	});

	// it("detects tabs indentation", () => {
	// 	const testFile = path.resolve(testDataPath, "tabs/_package.json");
	// 	const [, indent] = readPackageJsonAndIndent(testFile);
	// 	const expectedIndent = "\t";
	// 	assert.strictEqual(indent, expectedIndent);
	// });
});
