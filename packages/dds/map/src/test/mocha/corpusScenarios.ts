/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Scenario scripts for the cross-language SharedMap merge-semantics corpus.
 *
 * Each scenario is a deterministic script of client operations and message
 * delivery steps, executed against the real SharedMap by corpusGenerator.spec.ts.
 * The observed states and events are recorded as the oracle output that other
 * implementations (e.g. a Gleam map kernel) replay and assert against.
 *
 * See ./corpus/README.md for the replay contract.
 */

/* eslint-disable unicorn/no-null, @rushstack/no-new-null -- JSON null is part of
 * SharedMap's storable value domain, and the corpus must distinguish a stored null
 * from an absent key; these scenarios exercise that on purpose. */

/**
 * A JSON-representable value used in corpus scenarios.
 */
export type CorpusJsonValue =
	| string
	| number
	| boolean
	| null
	| CorpusJsonValue[]
	| { [key: string]: CorpusJsonValue };

/**
 * A single step in a corpus scenario.
 *
 * Op steps ("set"/"delete"/"clear") apply optimistically on the issuing client
 * and enqueue one message in the shared sequencing queue. Delivery steps
 * ("processSome"/"processAll") sequence queued messages in submission order and
 * deliver each to every client (as an ack on the originator, as a remote op on
 * the others). "check" records an observation of all clients.
 */
export type CorpusStep =
	| { action: "set"; client: string; key: string; value: CorpusJsonValue }
	| { action: "delete"; client: string; key: string }
	| { action: "clear"; client: string }
	| { action: "processSome"; count: number }
	| { action: "processAll" }
	| { action: "check" };

/**
 * A scripted merge-semantics scenario.
 */
export interface CorpusScenario {
	name: string;
	description: string;
	clients: string[];
	steps: CorpusStep[];
}

const check: CorpusStep = { action: "check" };
const processAll: CorpusStep = { action: "processAll" };

/**
 * The corpus scenario scripts.
 */
export const corpusScenarios: CorpusScenario[] = [
	{
		name: "basic-set",
		description: "Single client sets two keys; all clients converge.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "x", value: 1 },
			{ action: "set", client: "A", key: "y", value: "two" },
			processAll,
			check,
		],
	},
	{
		name: "basic-delete",
		description: "Set then delete a key after sequencing.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "x", value: 1 },
			processAll,
			{ action: "delete", client: "A", key: "x" },
			processAll,
			check,
		],
	},
	{
		name: "basic-clear",
		description: "Clear removes all sequenced entries and emits per-key events.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "x", value: 1 },
			{ action: "set", client: "A", key: "y", value: 2 },
			processAll,
			{ action: "clear", client: "A" },
			processAll,
			check,
		],
	},
	{
		name: "concurrent-set-lww",
		description: "Two clients set the same key concurrently; later sequenced set wins.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "x", value: 1 },
			{ action: "set", client: "B", key: "x", value: 2 },
			processAll,
			check,
		],
	},
	{
		name: "concurrent-set-lww-reverse",
		description: "Same as concurrent-set-lww with submission order reversed.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "B", key: "x", value: 2 },
			{ action: "set", client: "A", key: "x", value: 1 },
			processAll,
			check,
		],
	},
	{
		name: "set-vs-delete",
		description: "Concurrent set and delete of the same key; delete sequenced last wins.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "x", value: 1 },
			processAll,
			{ action: "set", client: "A", key: "x", value: 9 },
			{ action: "delete", client: "B", key: "x" },
			processAll,
			check,
		],
	},
	{
		name: "delete-vs-set",
		description: "Concurrent delete and set of the same key; set sequenced last wins.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "x", value: 1 },
			processAll,
			{ action: "delete", client: "B", key: "x" },
			{ action: "set", client: "A", key: "x", value: 9 },
			processAll,
			check,
		],
	},
	{
		name: "set-racing-clear",
		description: "Set sequenced before a concurrent clear is wiped by it.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "x", value: 1 },
			processAll,
			{ action: "set", client: "A", key: "y", value: 2 },
			{ action: "clear", client: "B" },
			processAll,
			check,
		],
	},
	{
		name: "clear-racing-set",
		description: "Set sequenced after a concurrent clear survives it.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "x", value: 1 },
			processAll,
			{ action: "clear", client: "B" },
			{ action: "set", client: "A", key: "y", value: 2 },
			processAll,
			check,
		],
	},
	{
		name: "pending-masks-remote-set",
		description:
			"A remote set arriving while a local pending set exists on the same key is " +
			"masked: the optimistic view and events are unaffected on the pending client.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "B", key: "x", value: 2 },
			{ action: "set", client: "A", key: "x", value: 1 },
			{ action: "processSome", count: 1 },
			check,
			{ action: "processSome", count: 1 },
			check,
		],
	},
	{
		name: "pending-masks-remote-delete",
		description: "A remote delete is masked by a local pending set on the same key.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "x", value: 1 },
			processAll,
			{ action: "delete", client: "B", key: "x" },
			{ action: "set", client: "A", key: "x", value: 5 },
			{ action: "processSome", count: 1 },
			check,
			processAll,
			check,
		],
	},
	{
		name: "remote-clear-with-pending-set",
		description:
			"A remote clear arrives while a local set is pending; the pending set " +
			"survives optimistically and the cleared key disappears.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "x", value: 1 },
			processAll,
			{ action: "clear", client: "B" },
			{ action: "set", client: "A", key: "y", value: 7 },
			{ action: "processSome", count: 1 },
			check,
			processAll,
			check,
		],
	},
	{
		name: "multiple-pending-sets",
		description:
			"Several unacked sets to one key form a single lifetime; the optimistic " +
			"view shows the latest and is stable across incremental acks.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "x", value: 1 },
			{ action: "set", client: "A", key: "x", value: 2 },
			{ action: "set", client: "A", key: "x", value: 3 },
			check,
			{ action: "processSome", count: 1 },
			check,
			processAll,
			check,
		],
	},
	{
		name: "lifetime-after-delete",
		description:
			"A pending delete followed by a pending set on the same key starts a new " +
			"lifetime; the key re-appears with the new value.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "x", value: 1 },
			processAll,
			{ action: "delete", client: "A", key: "x" },
			{ action: "set", client: "A", key: "x", value: 2 },
			check,
			processAll,
			check,
		],
	},
	{
		name: "clear-then-set-pending",
		description:
			"A pending clear followed by a pending set: the set survives the clear in " +
			"the optimistic view and after sequencing.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "x", value: 1 },
			processAll,
			{ action: "clear", client: "A" },
			{ action: "set", client: "A", key: "x", value: 2 },
			check,
			processAll,
			check,
		],
	},
	{
		name: "delete-nonexistent",
		description:
			"Deleting a key that was never set: the op is still sequenced; local " +
			"clients emit no event, remote clients emit valueChanged with no previous value.",
		clients: ["A", "B"],
		steps: [{ action: "delete", client: "A", key: "ghost" }, processAll, check],
	},
	{
		name: "iteration-order-readd",
		description: "Deleting and re-adding a key moves it to the end of iteration order.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "a", value: 1 },
			{ action: "set", client: "A", key: "b", value: 2 },
			{ action: "set", client: "A", key: "c", value: 3 },
			processAll,
			{ action: "delete", client: "A", key: "b" },
			processAll,
			{ action: "set", client: "A", key: "b", value: 22 },
			processAll,
			check,
		],
	},
	{
		name: "iteration-order-pending",
		description:
			"Iteration order with unacked entries: each client sees its own pending " +
			"entries after sequenced ones; after sequencing, order converges to sequence order.",
		clients: ["A", "B"],
		steps: [
			{ action: "set", client: "A", key: "a", value: 1 },
			{ action: "set", client: "B", key: "b", value: 2 },
			{ action: "set", client: "A", key: "c", value: 3 },
			check,
			processAll,
			check,
		],
	},
	{
		name: "three-client-converge",
		description: "Mixed concurrent ops from three clients converge to the same state.",
		clients: ["A", "B", "C"],
		steps: [
			{ action: "set", client: "A", key: "x", value: 1 },
			{ action: "set", client: "B", key: "y", value: 2 },
			processAll,
			{ action: "delete", client: "C", key: "x" },
			{ action: "clear", client: "B" },
			{ action: "set", client: "A", key: "z", value: 3 },
			processAll,
			check,
		],
	},
	{
		name: "complex-values",
		description: "Nested objects, arrays, null, and booleans survive the op round-trip.",
		clients: ["A", "B"],
		steps: [
			{
				action: "set",
				client: "A",
				key: "obj",
				value: { nested: { list: [1, "two", null, true], flag: false } },
			},
			{ action: "set", client: "B", key: "nil", value: null },
			processAll,
			check,
		],
	},
];
