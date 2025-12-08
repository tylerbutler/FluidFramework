/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { expect } from "chai";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { handlers } from "../../../library/repoPolicyCheck/npmPackages.js";

describe("npm-package-metadata-and-sorting", () => {
	const handler = handlers.find((h) => h.name === "npm-package-metadata-and-sorting");

	if (handler === undefined) {
		throw new Error("npm-package-metadata-and-sorting handler not found");
	}

	let tempDir: string;
	let gitRoot: string;

	beforeEach(() => {
		// Create a temporary directory for test files
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "npm-package-test-"));
		gitRoot = tempDir;
	});

	afterEach(() => {
		// Clean up temporary directory
		if (tempDir) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
	});

	describe("repository.directory field validation", () => {
		it("should pass when root package.json does not have repository.directory field", async () => {
			const packageJson = {
				name: "test-package",
				version: "1.0.0",
				author: "Microsoft and contributors",
				license: "MIT",
				repository: {
					type: "git",
					url: "https://github.com/microsoft/FluidFramework.git",
				},
				homepage: "https://fluidframework.com",
				scripts: {},
			};

			const filePath = path.join(gitRoot, "package.json");
			fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));

			const result = await handler.handler(filePath, gitRoot);
			expect(result).to.be.undefined;
		});

		it("should fail when root package.json has repository.directory field", async () => {
			const packageJson = {
				name: "test-package",
				version: "1.0.0",
				author: "Microsoft and contributors",
				license: "MIT",
				repository: {
					type: "git",
					url: "https://github.com/microsoft/FluidFramework.git",
					directory: ".",
				},
				homepage: "https://fluidframework.com",
				scripts: {},
			};

			const filePath = path.join(gitRoot, "package.json");
			fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));

			const result = await handler.handler(filePath, gitRoot);
			expect(result).to.include(
				'repository.directory: "." field is present but should be omitted from root package',
			);
		});

		it("should fail when non-root package.json does not have repository.directory field", async () => {
			const packageJson = {
				name: "test-subpackage",
				version: "1.0.0",
				author: "Microsoft and contributors",
				license: "MIT",
				repository: {
					type: "git",
					url: "https://github.com/microsoft/FluidFramework.git",
				},
				homepage: "https://fluidframework.com",
				scripts: {},
			};

			const subDir = path.join(gitRoot, "packages", "test");
			fs.mkdirSync(subDir, { recursive: true });
			const filePath = path.join(subDir, "package.json");
			fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));

			const result = await handler.handler(filePath, gitRoot);
			expect(result).to.include(
				'repository.directory field is missing but should be set to "packages/test"',
			);
		});

		it("should pass when non-root package.json has correct repository.directory field", async () => {
			const packageJson = {
				name: "test-subpackage",
				version: "1.0.0",
				author: "Microsoft and contributors",
				license: "MIT",
				repository: {
					type: "git",
					url: "https://github.com/microsoft/FluidFramework.git",
					directory: "packages/test",
				},
				homepage: "https://fluidframework.com",
				scripts: {},
			};

			const subDir = path.join(gitRoot, "packages", "test");
			fs.mkdirSync(subDir, { recursive: true });
			const filePath = path.join(subDir, "package.json");
			fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));

			const result = await handler.handler(filePath, gitRoot);
			expect(result).to.be.undefined;
		});

		it("should fail when non-root package.json has wrong repository.directory field", async () => {
			const packageJson = {
				name: "test-subpackage",
				version: "1.0.0",
				author: "Microsoft and contributors",
				license: "MIT",
				repository: {
					type: "git",
					url: "https://github.com/microsoft/FluidFramework.git",
					directory: "packages/wrong",
				},
				homepage: "https://fluidframework.com",
				scripts: {},
			};

			const subDir = path.join(gitRoot, "packages", "test");
			fs.mkdirSync(subDir, { recursive: true });
			const filePath = path.join(subDir, "package.json");
			fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));

			const result = await handler.handler(filePath, gitRoot);
			expect(result).to.include(
				'repository.directory: "packages/wrong" !== "packages/test"',
			);
		});
	});
});
