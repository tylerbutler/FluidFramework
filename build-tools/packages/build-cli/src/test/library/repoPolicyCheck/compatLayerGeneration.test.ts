/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "node:assert";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "mocha";

import {
	DEFAULT_GENERATION_DIR,
	DEFAULT_GENERATION_FILE_NAME,
	generateLayerFileContent,
} from "../../../library/compatLayerGeneration.js";
import { handler } from "../../../library/repoPolicyCheck/compatLayerGeneration.js";

describe("compat-layer-generation policy handler", () => {
	let tempDir: string;
	const fakeRoot = "/fake/root";

	beforeEach(async () => {
		tempDir = await mkdtemp(path.join(tmpdir(), "compat-policy-test-"));
		await mkdir(path.join(tempDir, DEFAULT_GENERATION_DIR), { recursive: true });
	});

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true });
	});

	it("has the expected name", () => {
		assert.strictEqual(handler.name, "compat-layer-generation");
	});

	it("matches package.json files", () => {
		assert.ok(handler.match.test("package.json"));
		assert.ok(handler.match.test("packages/foo/package.json"));
		assert.ok(!handler.match.test("package.json.bak"));
		assert.ok(!handler.match.test("src/index.ts"));
	});

	it("returns undefined for packages without fluidCompatMetadata and no file", async () => {
		const pkgJson = { name: "test-pkg", version: "1.0.0" };
		const pkgJsonPath = path.join(tempDir, "package.json");
		await writeFile(pkgJsonPath, JSON.stringify(pkgJson));

		const result = await handler.handler(pkgJsonPath, fakeRoot);
		assert.strictEqual(result, undefined);
	});

	it("returns undefined for packages without a version field", async () => {
		const pkgJson = { name: "workspace-root" };
		const pkgJsonPath = path.join(tempDir, "package.json");
		await writeFile(pkgJsonPath, JSON.stringify(pkgJson));

		const result = await handler.handler(pkgJsonPath, fakeRoot);
		assert.strictEqual(result, undefined);
	});

	it("returns undefined for patch versions even with metadata", async () => {
		const pkgJson = {
			name: "test-pkg",
			version: "1.0.1",
			fluidCompatMetadata: {
				generation: 5,
				releaseDate: "2025-01-01",
				releasePkgVersion: "1.0.0",
			},
		};
		const pkgJsonPath = path.join(tempDir, "package.json");
		await writeFile(pkgJsonPath, JSON.stringify(pkgJson));

		const result = await handler.handler(pkgJsonPath, fakeRoot);
		assert.strictEqual(result, undefined);
	});

	it("returns undefined when generation file is up to date", async () => {
		const generation = 5;
		const pkgJson = {
			name: "test-pkg",
			version: "2.0.0",
			fluidCompatMetadata: {
				generation,
				releaseDate: new Date().toISOString().split("T")[0],
				releasePkgVersion: "2.0.0",
			},
		};
		const pkgJsonPath = path.join(tempDir, "package.json");
		await writeFile(pkgJsonPath, JSON.stringify(pkgJson));

		// Write up-to-date generation file
		const genFilePath = path.join(tempDir, DEFAULT_GENERATION_DIR, DEFAULT_GENERATION_FILE_NAME);
		await writeFile(genFilePath, generateLayerFileContent(generation));

		const result = await handler.handler(pkgJsonPath, fakeRoot);
		assert.strictEqual(result, undefined);
	});

	it("returns error when generation file is missing", async () => {
		const pkgJson = {
			name: "test-pkg",
			version: "2.0.0",
			fluidCompatMetadata: {
				generation: 5,
				releaseDate: new Date().toISOString().split("T")[0],
				releasePkgVersion: "2.0.0",
			},
		};
		const pkgJsonPath = path.join(tempDir, "package.json");
		await writeFile(pkgJsonPath, JSON.stringify(pkgJson));

		const result = await handler.handler(pkgJsonPath, fakeRoot);
		assert.ok(result !== undefined, "Expected an error message for missing generation file");
		assert.ok(result.includes("out of date"), `Unexpected error message: ${result}`);
	});

	it("returns error when generation file content is wrong", async () => {
		const generation = 5;
		const pkgJson = {
			name: "test-pkg",
			version: "2.0.0",
			fluidCompatMetadata: {
				generation,
				releaseDate: new Date().toISOString().split("T")[0],
				releasePkgVersion: "2.0.0",
			},
		};
		const pkgJsonPath = path.join(tempDir, "package.json");
		await writeFile(pkgJsonPath, JSON.stringify(pkgJson));

		// Write wrong content
		const genFilePath = path.join(tempDir, DEFAULT_GENERATION_DIR, DEFAULT_GENERATION_FILE_NAME);
		await writeFile(genFilePath, "wrong content");

		const result = await handler.handler(pkgJsonPath, fakeRoot);
		assert.ok(result !== undefined, "Expected an error message for wrong file content");
		assert.ok(result.includes("out of date"), `Unexpected error message: ${result}`);
	});

	it("returns error for orphaned generation file", async () => {
		const pkgJson = { name: "test-pkg", version: "2.0.0" };
		const pkgJsonPath = path.join(tempDir, "package.json");
		await writeFile(pkgJsonPath, JSON.stringify(pkgJson));

		// Write orphaned generation file
		const genFilePath = path.join(tempDir, DEFAULT_GENERATION_DIR, DEFAULT_GENERATION_FILE_NAME);
		await writeFile(genFilePath, generateLayerFileContent(5));

		const result = await handler.handler(pkgJsonPath, fakeRoot);
		assert.ok(result !== undefined, "Expected an error message for orphaned file");
		assert.ok(result.includes("Orphaned"), `Unexpected error message: ${result}`);
	});

	it("returns undefined for invalid JSON", async () => {
		const pkgJsonPath = path.join(tempDir, "package.json");
		await writeFile(pkgJsonPath, "not valid json {{{");

		const result = await handler.handler(pkgJsonPath, fakeRoot);
		assert.strictEqual(result, undefined);
	});
});
