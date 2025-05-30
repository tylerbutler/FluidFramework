/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "node:assert";

import {
	type FieldAnchor,
	type IEditableForest,
	type ITreeSubscriptionCursor,
	TreeNavigationResult,
	TreeStoredSchemaRepository,
	rootFieldKey,
} from "../../../core/index.js";
// eslint-disable-next-line import/no-internal-modules
import { Context } from "../../../feature-libraries/flex-tree/context.js";
import {
	defaultSchemaPolicy,
	MockNodeIdentifierManager,
} from "../../../feature-libraries/index.js";
import {
	MockTreeCheckout,
	fieldCursorFromInsertable,
	forestWithContent,
} from "../../utils.js";
import {
	toStoredSchema,
	type ImplicitFieldSchema,
	type InsertableContent,
	type InsertableField,
	type UnsafeUnknownSchema,
} from "../../../simple-tree/index.js";

export function getReadonlyContext(
	forest: IEditableForest,
	schema: ImplicitFieldSchema,
): Context {
	return new Context(
		defaultSchemaPolicy,
		new MockTreeCheckout(forest, {
			schema: new TreeStoredSchemaRepository(toStoredSchema(schema)),
		}),
		new MockNodeIdentifierManager(),
	);
}

/**
 * Creates a context and its backing forest from the provided `content`.
 *
 * For creating mutable views use {@link viewWithContent}, but prefer this when possible as it has fewer dependencies and simpler setup.
 *
 * @returns The created context.
 */
export function contextWithContentReadonly(content: TreeSimpleContent): Context {
	const cursor = fieldCursorFromInsertable<UnsafeUnknownSchema>(
		content.schema,
		content.initialTree,
	);
	const forest = forestWithContent({
		initialTree: cursor,
		schema: toStoredSchema(content.schema),
	});
	return getReadonlyContext(forest, content.schema);
}

/**
 * Content that can populate a `SharedTree`.
 */
export interface TreeSimpleContent {
	readonly schema: ImplicitFieldSchema;
	/**
	 * Content to initialize the tree with.
	 */
	readonly initialTree: InsertableContent | undefined;
}

/**
 * Content that can populate a `SharedTree`.
 */
export interface TreeSimpleContentTyped<T extends ImplicitFieldSchema> {
	readonly schema: T;
	/**
	 * Default tree content to initialize the tree with iff the tree is uninitialized
	 * (meaning it does not even have any schema set at all).
	 */
	readonly initialTree: InsertableField<T>;
}

/**
 * Creates a cursor from the provided `context` and moves it to the provided `anchor`.
 */
export function initializeCursor(
	context: Context,
	anchor: FieldAnchor,
): ITreeSubscriptionCursor {
	const cursor = context.checkout.forest.allocateCursor();
	assert.equal(
		context.checkout.forest.tryMoveCursorToField(anchor, cursor),
		TreeNavigationResult.Ok,
	);
	return cursor;
}

export const rootFieldAnchor: FieldAnchor = { parent: undefined, fieldKey: rootFieldKey };

/**
 * Initializes a readonly test tree, context, and cursor, and moves the cursor to the tree's root.
 *
 * @returns The initialized context and cursor.
 */
export function readonlyTreeWithContent(treeContent: TreeSimpleContent): {
	context: Context;
	cursor: ITreeSubscriptionCursor;
} {
	const context = contextWithContentReadonly(treeContent);
	const cursor = initializeCursor(context, rootFieldAnchor);

	return {
		context,
		cursor,
	};
}
