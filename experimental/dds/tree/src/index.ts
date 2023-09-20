/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Fluid DDS storing a tree.
 *
 * @packageDocumentation
 */

/**
 * This file represents the public API. Consumers of this library will not see exported modules unless they are enumerated here.
 * Removing / editing existing exports here will often indicate a breaking change, so please be cognizant of changes made here.
 */

// API Exports

export {
	type Build,
	type BuildNode,
	type BuildTreeNode,
	Change,
	ChangeType,
	type Constraint,
	type Detach,
	type HasVariadicTraits,
	type Insert,
	type SetValue,
	StablePlace,
	StableRange,
} from './ChangeTypes';
export { Checkout, CheckoutEvent, type ICheckoutEvents, EditValidationResult } from './Checkout';
export { isSharedTreeEvent, sharedTreeAssertionErrorType, Result } from './Common';
export { EagerCheckout } from './EagerCheckout';
export type { OrderedEditSet, EditHandle } from './EditLog';
export {
	setTrait,
	areRevisionViewsSemanticallyEqual,
	type BadPlaceValidationResult,
	type BadRangeValidationResult,
	PlaceValidationResult,
	type RangeValidationResult,
	RangeValidationResultKind,
} from './EditUtilities';
export { SharedTreeDiagnosticEvent, SharedTreeEvent } from './EventTypes';
export { type Delta, Forest, type ForestNode, type ParentData } from './Forest';
export type {
	CompressedId,
	Definition,
	DetachedSequenceId,
	EditId,
	InternedStringId,
	FinalCompressedId,
	LocalCompressedId,
	NodeId,
	NodeIdBrand,
	StableNodeId,
	SessionSpaceCompressedId,
	SessionUnique,
	TraitLabel,
	UuidString,
	AttributionId,
} from './Identifiers';
export { isDetachedSequenceId } from './Identifiers';
export { initialTree } from './InitialTree';
export { LazyCheckout } from './LazyCheckout';
export type { LogViewer } from './LogViewer';
export type { NodeIdContext, NodeIdGenerator, NodeIdConverter } from './NodeIdUtilities';
export {
	type MergeHealthStats,
	SharedTreeMergeHealthTelemetryHeartbeat,
	useFailedSequencedEditTelemetry,
} from './MergeHealth';
export { comparePayloads } from './PayloadUtilities';
export {
	Side,
	EditStatus,
	type TreeNode,
	type TreeNodeSequence,
	type Payload,
	ConstraintEffect,
	type Edit,
	type ChangeInternal,
	type InternalizedChange,
	type ChangeNode,
	type ChangeNode_0_0_2,
	type EditLogSummary,
	type FluidEditHandle,
	type SharedTreeSummaryBase,
	type EditWithoutId,
	type PlaceholderTree,
	type EditBase,
	type HasTraits,
	type InsertInternal,
	type DetachInternal,
	type BuildInternal,
	type SetValueInternal,
	type ConstraintInternal,
	type BuildNodeInternal,
	type StablePlaceInternal_0_0_2,
	type StableRangeInternal_0_0_2,
	type NodeData,
	type TraitMap,
	ChangeTypeInternal,
	type TraitLocationInternal_0_0_2,
	WriteFormat,
	type ConstraintInternal_0_0_2,
	type StablePlaceInternal,
	type StableRangeInternal,
	type BuildNodeInternal_0_0_2,
	type BuildInternal_0_0_2,
	type InsertInternal_0_0_2,
	type DetachInternal_0_0_2,
	type SetValueInternal_0_0_2,
	type TraitLocationInternal,
} from './persisted-types';
export type { ReconciliationChange, ReconciliationEdit, ReconciliationPath } from './ReconciliationPath';
export { type Revision } from './RevisionValueCache';
export { RevisionView, TransactionView } from './RevisionView';
export { TreeNodeHandle } from './TreeNodeHandle';
export { getTraitLocationOfRange, placeFromStablePlace, rangeFromStableRange } from './TreeViewUtilities';
export {
	type SharedTreeArgs,
	type SharedTreeOptions,
	type SharedTreeBaseOptions,
	type SharedTreeOptions_0_0_2,
	type SharedTreeOptions_0_1_1,
	SharedTreeFactory,
	SharedTree,
	type EditCommittedHandler,
	type SequencedEditAppliedHandler,
	type EditCommittedEventArguments,
	type SequencedEditAppliedEventArguments,
	type EditApplicationOutcome,
	type ISharedTreeEvents,
	type StashedLocalOpMetadata,
} from './SharedTree';
export type { StringInterner } from './StringInterner';

/**
 * TODO:#61413: Publish test utilities from a separate test package
 */
export {
	getSerializedUploadedEditChunkContents as getUploadedEditChunkContents,
	getSerializedUploadedEditChunkContents,
} from './SummaryTestUtilities';

export { Transaction, TransactionEvent, type TransactionEvents } from './Transaction';
export {
	TransactionInternal,
	GenericTransaction,
	type GenericTransactionPolicy,
	type EditingResult,
	type EditingResultBase,
	type FailedEditingResult,
	type ValidEditingResult,
	type TransactionState,
	type TransactionFailure,
	type SucceedingTransactionState,
	type FailingTransactionState,
	type ChangeResult,
} from './TransactionInternal';
export type {
	NodeInTrait,
	PlaceIndex,
	TreeViewNode,
	TreeView,
	TraitNodeIndex,
	TreeViewPlace,
	TreeViewRange,
	TraitLocation,
} from './TreeView';
