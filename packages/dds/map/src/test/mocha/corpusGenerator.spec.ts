/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";

import {
	MockContainerRuntimeFactory,
	MockFluidDataStoreRuntime,
	MockStorage,
} from "@fluidframework/test-runtime-utils/internal";

import { type ISharedMap, type IValueChanged, SharedMap } from "../../index.js";

import {
	type CorpusJsonValue,
	type CorpusScenario,
	corpusScenarios,
} from "./corpusScenarios.js";
import { _dirname } from "./dirname.cjs";

/**
 * An event observed on one client, in emission order since the previous check.
 */
type RecordedEvent =
	| { event: "valueChanged"; key: string; previousValue?: CorpusJsonValue; local: boolean }
	| { event: "clear"; local: boolean };

/**
 * The observed state of a single client at a check step.
 */
interface ClientObservation {
	/**
	 * Entries in iteration order (the order `map.entries()` yields them).
	 */
	entries: [string, CorpusJsonValue][];
	/**
	 * Events emitted on this client since the previous check (or scenario start).
	 */
	events: RecordedEvent[];
}

/**
 * The recorded oracle output for one "check" step.
 */
interface CorpusObservation {
	/**
	 * Index into the scenario's steps array of the "check" step this records.
	 */
	afterStep: number;
	/**
	 * True when the sequencing queue was empty at this check, in which case all
	 * clients are asserted (and recorded) to have identical entries.
	 */
	converged: boolean;
	clients: Record<string, ClientObservation>;
}

/**
 * The full serialized corpus file: the scenario script plus oracle observations.
 */
interface CorpusFile extends CorpusScenario {
	formatVersion: 1;
	observations: CorpusObservation[];
}

function createConnectedMap(
	id: string,
	runtimeFactory: MockContainerRuntimeFactory,
): ISharedMap {
	const dataStoreRuntime = new MockFluidDataStoreRuntime({
		registry: [SharedMap.getFactory()],
	});
	runtimeFactory.createContainerRuntime(dataStoreRuntime);
	const services = {
		deltaConnection: dataStoreRuntime.createDeltaConnection(),
		objectStorage: new MockStorage(),
	};
	const map = SharedMap.create(dataStoreRuntime, id);
	map.connect(services);
	return map;
}

function snapshotEntries(map: ISharedMap): [string, CorpusJsonValue][] {
	return [...map.entries()].map(([key, value]) => [key, value as CorpusJsonValue]);
}

function runScenario(scenario: CorpusScenario): CorpusFile {
	const runtimeFactory = new MockContainerRuntimeFactory();
	const maps = new Map<string, ISharedMap>();
	const eventLogs = new Map<string, RecordedEvent[]>();

	for (const clientId of scenario.clients) {
		const map = createConnectedMap(clientId, runtimeFactory);
		const log: RecordedEvent[] = [];
		map.on("valueChanged", (changed: IValueChanged, local: boolean) => {
			const recorded: Extract<RecordedEvent, { event: "valueChanged" }> = {
				event: "valueChanged",
				key: changed.key,
				local,
			};
			if (changed.previousValue !== undefined) {
				recorded.previousValue = changed.previousValue as CorpusJsonValue;
			}
			log.push(recorded);
		});
		map.on("clear", (local: boolean) => {
			log.push({ event: "clear", local });
		});
		maps.set(clientId, map);
		eventLogs.set(clientId, log);
	}

	const getMap = (clientId: string): ISharedMap => {
		const map = maps.get(clientId);
		assert(map !== undefined, `Scenario references unknown client: ${clientId}`);
		return map;
	};

	const observations: CorpusObservation[] = [];
	for (const [stepIndex, step] of scenario.steps.entries()) {
		switch (step.action) {
			case "set": {
				getMap(step.client).set(step.key, step.value);
				break;
			}
			case "delete": {
				getMap(step.client).delete(step.key);
				break;
			}
			case "clear": {
				getMap(step.client).clear();
				break;
			}
			case "processSome": {
				assert(
					runtimeFactory.outstandingMessageCount >= step.count,
					`Step ${stepIndex}: cannot process ${step.count} messages, only ${runtimeFactory.outstandingMessageCount} outstanding`,
				);
				runtimeFactory.processSomeMessages(step.count);
				break;
			}
			case "processAll": {
				runtimeFactory.processAllMessages();
				break;
			}
			case "check": {
				const converged = runtimeFactory.outstandingMessageCount === 0;
				const clients: Record<string, ClientObservation> = {};
				for (const clientId of scenario.clients) {
					const log = eventLogs.get(clientId);
					assert(log !== undefined, "event log must exist for every client");
					clients[clientId] = {
						entries: snapshotEntries(getMap(clientId)),
						// Drain this client's event log into the observation.
						events: log.splice(0),
					};
				}
				if (converged) {
					// With no outstanding messages, every client's optimistic view must
					// equal its sequenced state, and all sequenced states must match.
					const [first, ...rest] = scenario.clients;
					assert(first !== undefined, "scenario must declare at least one client");
					for (const other of rest) {
						assert.deepStrictEqual(
							clients[other]?.entries,
							clients[first]?.entries,
							`clients ${first} and ${other} diverged at step ${stepIndex}`,
						);
					}
				}
				observations.push({ afterStep: stepIndex, converged, clients });
				break;
			}
			default: {
				assert.fail(`Unknown corpus step: ${JSON.stringify(step)}`);
			}
		}
	}

	assert(
		runtimeFactory.outstandingMessageCount === 0,
		"scenario must end with all messages processed",
	);
	assert(observations.length > 0, "scenario must contain at least one check step");

	return { formatVersion: 1, ...scenario, observations };
}

describe("SharedMap merge-semantics corpus generator", () => {
	// Compiled test output runs from (dist|lib)/test/mocha; the corpus JSON is
	// written back into the source tree, next to these scenario definitions.
	assert(/(dist|lib)[/\\]test[/\\]mocha$/.test(_dirname), "unexpected compiled test location");
	const corpusDir = path.resolve(_dirname, "../../../src/test/mocha/corpus/");

	before(() => {
		fs.mkdirSync(corpusDir, { recursive: true });
		// The generator is the source of truth: remove stale corpus files so
		// renamed/deleted scenarios don't leave orphans behind.
		for (const file of fs.readdirSync(corpusDir)) {
			if (file.endsWith(".json")) {
				fs.rmSync(path.join(corpusDir, file));
			}
		}
	});

	it("scenario names are unique", () => {
		const names = new Set(corpusScenarios.map((scenario) => scenario.name));
		assert.strictEqual(names.size, corpusScenarios.length, "duplicate scenario names");
	});

	for (const scenario of corpusScenarios) {
		it(`generates ${scenario.name}`, () => {
			const corpus = runScenario(scenario);
			const filePath = path.join(corpusDir, `${scenario.name}.json`);
			fs.writeFileSync(filePath, `${JSON.stringify(corpus, undefined, "\t")}\n`);
		});
	}
});
