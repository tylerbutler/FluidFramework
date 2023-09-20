/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export {
	type IdCreationRange,
	type SerializedIdCompressor,
	type SerializedIdCompressorWithNoSession,
	type SerializedIdCompressorWithOngoingSession,
	type IdCreationRangeWithStashedState,
	initialClusterCapacity,
} from "./persisted-types";

export type { IIdCompressorCore, IIdCompressor } from "./idCompressor";

export type { SessionSpaceCompressedId, OpSpaceCompressedId, SessionId, StableId } from "./identifiers";
