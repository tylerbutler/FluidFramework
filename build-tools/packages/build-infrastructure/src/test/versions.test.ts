/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "node:assert";
import path from "node:path";

import { expect } from "chai";
import { afterEach, describe, it } from "mocha";
import * as semver from "semver";

import { loadFluidRepo } from "../fluidRepo.js";
import type { ReleaseGroupName, WorkspaceName } from "../types.js";
import { setVersion } from "../versions.js";

import { testDataPath } from "./init.js";

const repo = loadFluidRepo(path.join(testDataPath, "./testRepo"));
const main = repo.releaseGroups.get("main" as ReleaseGroupName);
const secondWorkspace = repo.workspaces.get("second" as WorkspaceName);
assert(main !== undefined);
assert(secondWorkspace !== undefined);

describe("setVersion", () => {
	afterEach(async () => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		await setVersion(repo, [...repo.packages.values()], semver.parse("1.0.0")!);
		// await setVersion(
		// 	repo,
		// 	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		// 	repo.releaseGroups.get("group2" as ReleaseGroupName)!.packages,
		// 	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		// 	semver.parse("2.0.0")!,
		// );
		await setVersion(
			repo,
			secondWorkspace.packages,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			semver.parse("2.0.0")!,
		);
	});

	it("release group", async () => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		await setVersion(repo, main.packages, semver.parse("1.2.1")!);
		const allCorrect = main.packages.every((pkg) => pkg.version === "1.2.1");
		expect(main.version).to.equal("1.2.1");
		expect(allCorrect).to.be.true;
	});

	it("workspace", async () => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		await setVersion(repo, secondWorkspace.packages, semver.parse("2.2.1")!);
		const allCorrect = secondWorkspace.packages.every((pkg) => pkg.version === "2.2.1");
		expect(allCorrect).to.be.true;
	});

	it("repo", async () => {
		const packages = [...repo.packages.values()];
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		await setVersion(repo, packages, semver.parse("1.2.1")!);
		const allCorrect = packages.every((pkg) => pkg.version === "1.2.1");
		expect(allCorrect).to.be.true;
	});
});
