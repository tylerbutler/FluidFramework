/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export {
	type IInterval,
	type ISerializedInterval,
	type ISerializableInterval,
	IntervalOpType,
	IntervalType,
	type IIntervalHelpers,
	IntervalStickiness,
	type SerializedIntervalDelta,
	type CompressedSerializedInterval,
	endReferenceSlidingPreference,
	startReferenceSlidingPreference,
} from "./intervalUtils";
export { Interval, createInterval, intervalHelpers } from "./interval";
export {
	SequenceInterval,
	createSequenceInterval,
	createPositionReferenceFromSegoff,
	sequenceIntervalHelpers,
} from "./sequenceInterval";
