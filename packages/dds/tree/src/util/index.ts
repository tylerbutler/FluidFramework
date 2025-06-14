/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export {
	brand,
	type Brand,
	BrandedType,
	type NameFromBranded,
	type ValueFromBranded,
} from "./brand.js";
export { brandedNumberType, brandedStringType } from "./typeboxBrand.js";
export {
	brandOpaque,
	extractFromOpaque,
	type ExtractFromOpaque,
	type Opaque,
} from "./opaque.js";
export {
	deleteFromNestedMap,
	getOrAddInNestedMap,
	getOrDefaultInNestedMap,
	forEachInNestedMap,
	type NestedMap,
	type ReadonlyNestedMap,
	SizedNestedMap,
	populateNestedMap,
	setInNestedMap,
	tryAddToNestedMap,
	tryGetFromNestedMap,
	mapNestedMap,
	nestedMapToFlatList,
	nestedMapFromFlatList,
	getOrCreateInNestedMap,
} from "./nestedMap.js";
export { addToNestedSet, type NestedSet, nestedSetContains } from "./nestedSet.js";
export { type OffsetList, OffsetListFactory } from "./offsetList.js";
export type {
	areSafelyAssignable,
	Contravariant,
	Covariant,
	eitherIsAny,
	EnforceTypeCheckTests,
	Invariant,
	isAny,
	isAssignableTo,
	isStrictSubset,
	MakeNominal,
	requireFalse,
	requireTrue,
	requireAssignableTo,
	areOnlyKeys,
} from "./typeCheck.js";
export { StackyIterator } from "./stackyIterator.js";
export {
	asMutable,
	balancedReduce,
	clone,
	compareSets,
	getOrAddEmptyToMap,
	getOrCreate,
	isJsonObject,
	isReadonlyArray,
	type JsonCompatible,
	type JsonCompatibleObject,
	type JsonCompatibleReadOnly,
	type JsonCompatibleReadOnlyObject,
	JsonCompatibleReadOnlySchema,
	makeArray,
	mapIterable,
	filterIterable,
	type Mutable,
	type Populated,
	type RecursiveReadonly,
	assertValidIndex,
	assertValidRange,
	assertNonNegativeSafeInteger,
	objectToMap,
	invertMap,
	oneFromSet,
	type Named,
	compareNamed,
	disposeSymbol,
	type IDisposable,
	capitalize,
	assertValidRangeIndices,
	transformObjectMap,
	compareStrings,
	find,
	count,
	getLast,
	hasSome,
	hasSingle,
	defineLazyCachedProperty,
	copyPropertyIfDefined as copyProperty,
	getOrAddInMap,
	iterableHasSome,
} from "./utils.js";
export { ReferenceCountedBase, type ReferenceCounted } from "./referenceCounting.js";

export type {
	_RecursiveTrick,
	RestrictiveReadonlyRecord,
	RestrictiveStringRecord,
	_InlineTrick,
	FlattenKeys,
	IsUnion,
	UnionToIntersection,
	UnionToTuple,
	PopUnion,
} from "./typeUtils.js";

export { unsafeArrayToTuple } from "./typeUtils.js";

export {
	type BrandedKey,
	type BrandedKeyContent,
	type BrandedMapSubset,
	getOrCreateSlotContent,
	brandedSlot,
} from "./brandedMap.js";

export {
	RangeMap,
	type RangeQueryResult,
	newIntegerRangeMap,
} from "./rangeMap.js";

export {
	type IdAllocator,
	idAllocatorFromMaxId,
	idAllocatorFromState,
	type IdAllocationState,
	fakeIdAllocator,
} from "./idAllocator.js";

export {
	Breakable,
	type WithBreakable,
	breakingMethod,
	throwIfBroken,
	breakingClass,
} from "./breakable.js";

export { type TupleBTree, newTupleBTree, mergeTupleBTrees } from "./bTreeUtils.js";

export { cloneWithReplacements } from "./cloneWithReplacements.js";
