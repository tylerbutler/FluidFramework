/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {strict as assert} from "node:assert";

import { IPackage } from "@fluid-tools/build-infrastructure";
import { runCommand } from "@oclif/test";
import chai, { expect } from "chai";
import assertArrays from "chai-arrays";
import { describe, it } from "mocha";

chai.use(assertArrays);

interface jsonOutput {
	selected: IPackage[];
	filtered: IPackage[];
}

describe("flub test-only-filter", () => {
	it(`--all selector`, async () => {
		const { stdout } = await runCommand(["test-only-filter", "--quiet", "--json", "--all"], {
			root: import.meta.url,
		});
		const output: jsonOutput = JSON.parse(stdout) as jsonOutput;
		const { selected, filtered } = output;
		expect(selected).to.be.ofSize(filtered.length);
	});

	test
		.stdout()
		.command(["test-only-filter", "--quiet", "--json", "--dir", "."])
		.it(`--dir selector`, (ctx) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const output: jsonOutput = JSON.parse(ctx.stdout);
			const { selected, filtered } = output;
			console.debug(selected);
			console.debug(filtered);
			expect(selected).to.be.ofSize(1);
			expect(filtered).to.be.ofSize(1);

		const pkg = filtered[0];

		assert(pkg !== undefined);
		expect(pkg.name).to.equal("@fluid-tools/build-cli");
		expect(pkg.directory).to.equal("build-tools/packages/build-cli");
	});

			expect(selected.length).to.equal(1);
			expect(filtered.length).to.equal(1);
		});

	test
		.stdout()
		.command(["test-only-filter", "--quiet", "--json", "--releaseGroup", "build-tools"])
		.it(`--releaseGroup selector`, (ctx) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const output: jsonOutput = JSON.parse(ctx.stdout);
			const { selected, filtered } = output;
			console.debug(selected);
			console.debug(filtered);
			expect(selected).to.be.ofSize(6);
			expect(filtered).to.be.ofSize(6);
		});

	test
		.stdout()
		.command(["test-only-filter", "--quiet", "--json", "--all", "--private"])
		.it(`--private filter`, (ctx) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const output: jsonOutput = JSON.parse(ctx.stdout);
			const { filtered } = output;

			const names = filtered.map((p) => p.name);
			expect(names).to.be.containingAllOf([
				"@fluid-private/changelog-generator-wrapper",
				"@fluid-example/example-utils",
			]);
		});

	test
		.stdout()
		.command(["test-only-filter", "--quiet", "--json", "--all", "--no-private"])
		.it(`--no-private filter`, (ctx) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const output: jsonOutput = JSON.parse(ctx.stdout);
			const { filtered } = output;

			const names = filtered.map((p) => p.name);
			expect(names).to.not.be.containingAnyOf(["@fluid-private/changelog-generator-wrapper"]);
		});

	test
		.stdout()
		.command([
			"test-only-filter",
			"--quiet",
			"--json",
			"--all",
			"--skipScope",
			"@fluidframework",
		])
		.it(`--scope filter`, (ctx) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const output: jsonOutput = JSON.parse(ctx.stdout);
			const { filtered } = output;

			const names = filtered.map((p) => p.name);
			expect(names).to.be.containingAllOf([
				"@fluid-private/changelog-generator-wrapper",
				"@fluid-tools/build-cli",
				"fluid-framework",
			]);
		});
	});
});
