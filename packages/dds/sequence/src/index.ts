/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Supports distributed data structures which are list-like.
 *
 * This library's main export is {@link SharedString}, a DDS for storing and simultaneously editing a sequence of
 * text.
 *
 * See the package's README for a high-level introduction to `SharedString`'s feature set.
 * @remarks Note that SharedString is a sequence DDS but it has additional specialized features and behaviors for
 * working with text.
 *
 * @packageDocumentation
 */
export type {
	IMapMessageLocalMetadata,
	IValueOpEmitter,
	SequenceOptions,
} from "./defaultMapInterfaces";
export {
	type IInterval,
	Interval,
	type IIntervalHelpers,
	IntervalOpType,
	IntervalType,
	type ISerializableInterval,
	type ISerializedInterval,
	SequenceInterval,
	type SerializedIntervalDelta,
	IntervalStickiness,
	sequenceIntervalHelpers,
} from "./intervals";
export {
	type DeserializeCallback,
	type IIntervalCollectionEvent,
	type IIntervalCollection,
	type IntervalLocator,
	intervalLocatorFromEndpoint,
} from "./intervalCollection";
export {
	type IntervalIndex,
	type SequenceIntervalIndexes,
	type IOverlappingIntervalsIndex,
	createOverlappingIntervalsIndex,
	createOverlappingSequenceIntervalsIndex,
	type IEndpointInRangeIndex,
	type IStartpointInRangeIndex,
	createEndpointInRangeIndex,
	createStartpointInRangeIndex,
	type IIdIntervalIndex,
	createIdIntervalIndex,
	type IEndpointIndex,
	createEndpointIndex,
} from "./intervalIndex";
export {
	appendAddIntervalToRevertibles,
	appendChangeIntervalToRevertibles,
	appendDeleteIntervalToRevertibles,
	appendIntervalPropertyChangedToRevertibles,
	appendSharedStringDeltaToRevertibles,
	discardSharedStringRevertibles,
	type IntervalRevertible,
	revertSharedStringRevertibles,
	type SharedStringRevertible,
} from "./revertibles";
export { type ISharedSegmentSequenceEvents, SharedSegmentSequence } from "./sequence";
export {
	type ISequenceDeltaRange,
	SequenceDeltaEvent,
	SequenceEvent,
	SequenceMaintenanceEvent,
} from "./sequenceDeltaEvent";
export { SharedStringFactory } from "./sequenceFactory";
export {
	getTextAndMarkers,
	type ISharedString,
	SharedString,
	type SharedStringSegment,
} from "./sharedString";
export {
	type ISharedIntervalCollection,
	SharedIntervalCollection,
	SharedIntervalCollectionFactory,
} from "./sharedIntervalCollection";
export { type IJSONRunSegment, SharedSequence, SubSequence } from "./sharedSequence";
