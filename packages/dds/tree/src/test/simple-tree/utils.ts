/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	isTreeNode,
	isTreeNodeSchemaClass,
	TreeViewConfiguration,
	type ImplicitFieldSchema,
	type InsertableField,
	type InsertableTreeFieldFromImplicitField,
	type NodeKind,
	type TreeFieldFromImplicitField,
	type TreeLeafValue,
	type TreeNode,
	type TreeNodeSchema,
	type UnsafeUnknownSchema,
} from "../../simple-tree/index.js";
import { getView } from "../utils.js";
import type { TreeCheckout } from "../../shared-tree/index.js";
import { SchematizingSimpleTreeView } from "../../shared-tree/index.js";

/**
 * Initializes a node with the given schema and content.
 * @param schema - The schema of the node being initialized
 * @param content - The content that will be used to construct the node, or an unhydrated node of the correct `schema`.
 * @param hydrateNode - Whether or not the returned value will be hydrated.
 * @returns
 * * If `hydrateNode` is true, a hydrated node will be returned.
 * * If `hydrateNode` is false, then `content` will be used to initialize an unhydrated node (or, if `content` is already a hydrated node, it will be returned directly).
 * @remarks This function is useful for writing tests that want to test both the hydrated version of a node and the unhydrated version of a node with minimal code duplication.
 */
export function initNode<
	TInsertable,
	TSchema extends TreeNodeSchema<string, NodeKind, TreeNode | TreeLeafValue, TInsertable>,
>(
	schema: TSchema,
	content: TInsertable,
	hydrateNode: boolean,
): TreeFieldFromImplicitField<TSchema> {
	if (hydrateNode) {
		return hydrate(schema, content as InsertableField<TSchema>);
	}

	if (isTreeNode(content)) {
		return content as TreeFieldFromImplicitField<TSchema>;
	}

	if (isTreeNodeSchemaClass(schema)) {
		return new schema(content) as TreeFieldFromImplicitField<TSchema>;
	}

	return schema.create(content) as TreeFieldFromImplicitField<TSchema>;
}

/**
 * Generates a `describe` block for test suites that want to test both unhydrated and hydrated nodes.
 * @param title - the title of the test suite
 * @param runBoth - a suite that will be run twice, each in a different nested `describe` block.
 * The suite has access to an initialize function (see {@link initNode}) and a boolean that can be used to produce unhydrated nodes or hydrated nodes.
 * @param runOnce - an optional extra delegate that will run inside of the outer describe block.
 * This is useful for test cases that don't distinguish between unhydrated and hydrated scenarios.
 */
export function describeHydration(
	title: string,
	runBoth: (
		init: <
			TInsertable,
			TSchema extends TreeNodeSchema<string, NodeKind, TreeNode | TreeLeafValue, TInsertable>,
		>(
			schema: TSchema,
			tree: TInsertable,
		) => TreeFieldFromImplicitField<TSchema>,
		hydrated: boolean,
	) => void,
	runOnce?: () => void,
) {
	return describe(title, () => {
		describe("🐪 Unhydrated", () =>
			runBoth((schema, tree) => initNode(schema, tree, false), false));

		describe("🌊 Hydrated", () =>
			runBoth((schema, tree) => initNode(schema, tree, true), true));

		runOnce?.();
	});
}

/**
 * Given the schema and initial tree data, returns a hydrated tree node.
 * @remarks
 * For minimal/concise targeted unit testing of specific simple-tree content.
 *
 * This produces "marinated" nodes, meaning hydrated nodes which may not have an inner node cached yet.
 */
export function hydrate<const TSchema extends ImplicitFieldSchema>(
	schema: TSchema,
	initialTree: InsertableField<TSchema> | InsertableTreeFieldFromImplicitField<TSchema>,
): TreeFieldFromImplicitField<TSchema> {
	const view = getView(new TreeViewConfiguration({ schema, enableSchemaValidation: true }));
	view.initialize(initialTree as InsertableField<TSchema>);
	return view.root;
}

/**
 * {@link hydrate} but unsafe initialTree.
 * This may be required when the schema is not entirely statically typed, for example when looping over multiple test cases and thus using a imprecise schema type.
 * In such cases the "safe" version of hydrate may require `never` for the initial tree.
 */
export function hydrateUnsafe<const TSchema extends ImplicitFieldSchema>(
	schema: TSchema,
	initialTree: InsertableField<UnsafeUnknownSchema>,
): TreeFieldFromImplicitField<TSchema> {
	return hydrate(schema, initialTree as InsertableField<TSchema>);
}

/**
 * Similar to JSON stringify, but allows `undefined` at the root and returns numbers as-is at the root.
 */
export function pretty(arg: unknown): number | string {
	if (arg === undefined) {
		return "undefined";
	}
	if (typeof arg === "number") {
		return arg;
	}
	return JSON.stringify(arg);
}

/**
 * Creates a branch of the input tree view and returns a new tree view for the branch.
 *
 * @remarks To merge the branch back into the original view after applying changes on the branch view, use
 * `<originalView>.checkout.merge(<branchView>.checkout)`.
 *
 * @param originalView - The tree view to branch.
 * @returns A new tree view for a branch of the input tree view, and an {@link TreeCheckoutFork} object that can be
 * used to merge the branch back into the original view.
 */
export function getViewForForkedBranch<const TSchema extends ImplicitFieldSchema>(
	originalView: SchematizingSimpleTreeView<TSchema>,
): { forkView: SchematizingSimpleTreeView<TSchema>; forkCheckout: TreeCheckout } {
	const forkCheckout = originalView.checkout.branch();
	return {
		forkView: new SchematizingSimpleTreeView<TSchema>(
			forkCheckout,
			originalView.config,
			originalView.nodeKeyManager,
		),
		forkCheckout,
	};
}
