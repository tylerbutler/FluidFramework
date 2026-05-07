/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "node:assert/strict";
import { afterEach, beforeEach } from "mocha";
import { BuildMetrics, type Seconds, TaskCacheOutcome } from "../fluidBuild/buildMetrics";

describe("BuildMetrics", () => {
	const originalConsoleLog = console.log;
	let output: string[];

	beforeEach(() => {
		output = [];
		console.log = (message?: unknown) => {
			output.push(String(message ?? ""));
		};
	});

	afterEach(() => {
		console.log = originalConsoleLog;
	});

	it("prints executables with only not-run tasks in the breakdown", () => {
		const metrics = new BuildMetrics();
		metrics.recordTask({
			taskName: "tsc",
			packageName: "pkg-a",
			command: "tsc",
			executable: "tsc",
			outcome: TaskCacheOutcome.Failed,
			isIncremental: true,
			supportsRecheck: true,
			execTimeSeconds: 5 as Seconds,
			queueWaitSeconds: 0 as Seconds,
			worker: true,
		});
		metrics.recordTask({
			taskName: "eslint",
			packageName: "pkg-b",
			command: "eslint",
			executable: "eslint",
			outcome: TaskCacheOutcome.NotRun,
			isIncremental: true,
			supportsRecheck: true,
			execTimeSeconds: 0 as Seconds,
			queueWaitSeconds: 0 as Seconds,
			worker: true,
		});

		metrics.printSummary();

		const summaryOutput = output.join("\n");
		assert(summaryOutput.includes("eslint"));
	});
});
