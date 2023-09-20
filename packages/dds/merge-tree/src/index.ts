/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export type {
	IAttributionCollection,
	IAttributionCollectionSerializer,
	IAttributionCollectionSpec,
	SerializedAttributionCollection,
	SequenceOffsets,
} from "./attributionCollection";
export { createInsertOnlyAttributionPolicy } from "./attributionPolicy";
export { type IIntegerRange } from "./base";
export { Client } from "./client";
export type {
	ConflictAction,
	Dictionary,
	IRBAugmentation,
	IRBMatcher,
	KeyComparer,
	Property,
	PropertyAction,
	QProperty,
	RBNode,
	RBNodeActions,
	SortedDictionary,
} from "./collections";
export { RBColor, RedBlackTree, Stack } from "./collections";
export {
	LocalClientId,
	NonCollabClient,
	TreeMaintenanceSequenceNumber,
	UnassignedSequenceNumber,
	UniversalSequenceNumber,
} from "./constants";
export {
	createDetachedLocalReferencePosition,
	LocalReferenceCollection,
	type LocalReferencePosition,
	SlidingPreference,
} from "./localReference";
export {
	type AttributionPolicy,
	type IMergeTreeAttributionOptions,
	type IMergeTreeOptions,
	getSlideToSegoff,
} from "./mergeTree";
export type {
	IMergeTreeClientSequenceArgs,
	IMergeTreeDeltaCallbackArgs,
	IMergeTreeDeltaOpArgs,
	IMergeTreeMaintenanceCallbackArgs,
	IMergeTreeSegmentDelta,
	MergeTreeDeltaCallback,
	MergeTreeDeltaOperationType,
	MergeTreeDeltaOperationTypes,
	MergeTreeMaintenanceCallback,
} from "./mergeTreeDeltaCallback";
export { MergeTreeMaintenanceType } from "./mergeTreeDeltaCallback";
export {
	BaseSegment,
	CollaborationWindow,
	compareNumbers,
	compareStrings,
	debugMarkerToString,
	type IConsensusInfo,
	type IJSONMarkerSegment,
	type IMarkerModifiedAction,
	type IMergeNodeCommon,
	internedSpaces,
	type IRemovalInfo,
	type ISegment,
	type ISegmentAction,
	Marker,
	MergeNode,
	reservedMarkerIdKey,
	reservedMarkerSimpleTypeKey,
	type SegmentAccumulator,
	type SegmentGroup,
	toRemovalInfo,
} from "./mergeTreeNodes";
export {
	type Trackable,
	TrackingGroup,
	type ITrackingGroup,
	TrackingGroupCollection,
} from "./mergeTreeTracking";
export {
	createAnnotateMarkerOp,
	createAnnotateRangeOp,
	createGroupOp,
	createInsertOp,
	createInsertSegmentOp,
	createRemoveRangeOp,
} from "./opBuilder";
export type {
	ICombiningOp,
	IJSONSegment,
	IMarkerDef,
	IMergeTreeAnnotateMsg,
	IMergeTreeDelta,
	IMergeTreeDeltaOp,
	IMergeTreeGroupMsg,
	IMergeTreeInsertMsg,
	IMergeTreeOp,
	IMergeTreeRemoveMsg,
	IRelativePosition,
} from "./ops";
export { MergeTreeDeltaType, ReferenceType } from "./ops";
export {
	addProperties,
	clone,
	combine,
	createMap,
	extend,
	extendIfUndefined,
	type IConsensusValue,
	type MapLike,
	matchProperties,
	type PropertySet,
} from "./properties";
export {
	compareReferencePositions,
	DetachedReferencePosition,
	maxReferencePosition,
	minReferencePosition,
	type RangeStackMap,
	type ReferencePosition,
	refGetRangeLabels,
	refGetTileLabels,
	refHasRangeLabel,
	refHasRangeLabels,
	refHasTileLabel,
	refHasTileLabels,
	refTypeIncludesFlag,
	reservedRangeLabelsKey,
	reservedTileLabelsKey,
} from "./referencePositions";
export { SegmentGroupCollection } from "./segmentGroupCollection";
export { PropertiesManager, PropertiesRollback } from "./segmentPropertiesManager";
export { SortedSet } from "./sortedSet";
export { SortedSegmentSet, type SortedSegmentSetItem } from "./sortedSegmentSet";
export { type IJSONTextSegment, type IMergeTreeTextHelper, TextSegment } from "./textSegment";
export {
	appendToMergeTreeDeltaRevertibles,
	discardMergeTreeDeltaRevertible,
	isMergeTreeDeltaRevertible,
	type MergeTreeDeltaRevertible,
	type MergeTreeRevertibleDriver,
	revertMergeTreeDeltaRevertibles,
} from "./revertibles";
