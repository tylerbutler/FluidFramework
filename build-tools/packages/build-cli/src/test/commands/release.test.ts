/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { runCommand } from "@oclif/test";
import { expect } from "chai";
import { describe, it } from "mocha";

import type { VersionDetails } from "../../library/context.js";
import { takeHighestOfMinorSeries } from "../../library/release.js";
import { FluidReleaseMachine } from "../../machines/index.js";

const knownUnhandledStates: Set<string> = new Set([
	// Known unhandled states can be added here temporarily during development.
]);

const machineStates = FluidReleaseMachine.states()
	.filter((s) => !knownUnhandledStates.has(s))
	.sort();

describe("release command handles all states", () => {
	for (const state of machineStates) {
		it(`Handles state: '${state}'`, async () => {
			const { error } = await runCommand(
				[
					"release",
					"--releaseGroup",
					"build-tools",
					"--bumpType",
					"patch",
					"--testMode",
					"--state",
					state,
					"--verbose",
				],
				{
					root: import.meta.url,
				},
			);
			expect(error?.oclif?.exit).to.equal(100);
		});
	}
});

describe("takeHighestOfMinorSeries", () => {
	it("semver", () => {
		const input: VersionDetails[] = [
			{ version: "1.2.3" },
			{ version: "1.2.2" },
			{ version: "0.51.3" },
			{ version: "0.51.2" },
			{ version: "2.2.3" },
			{ version: "2.2.2" },
		];
		const result = takeHighestOfMinorSeries(input);

		expect(result).to.deep.equal([
			{ version: "2.2.3" },
			{ version: "1.2.3" },
			{ version: "0.51.3" },
		]);
	});

	it("internal versions", () => {
		const input: VersionDetails[] = [
			{ version: "2.0.0-internal.1.0.0" },
			{ version: "2.0.0-internal.1.2.1" },
			{ version: "2.0.0-internal.1.3.0" },
			{ version: "2.0.0-internal.2.2.0" },
			{ version: "2.0.0-internal.2.2.1" },
			{ version: "2.0.0-internal.2.2.3" },
		];
		const result = takeHighestOfMinorSeries(input);

		expect(result).to.equal(1);
		expect(result).to.deep.equal([
			{ version: "2.0.0-internal.2.2.3" },
			{ version: "2.0.0-internal.1.3.0" },
		]);
	});

	it("virtualPatch versions", () => {
		const input: VersionDetails[] = [
			{ version: "0.3.1000" },
			{ version: "0.3.2000" },
			{ version: "0.4.1000" },
			{ version: "0.4.2000" },
			{ version: "0.4.2001" },
			{ version: "0.4.2002" },
		];
		const result = takeHighestOfMinorSeries(input);

		expect(result).to.equal(1);
		expect(result).to.deep.equal([{ version: "0.4.2002" }, { version: "0.3.2000" }]);
	});
});
