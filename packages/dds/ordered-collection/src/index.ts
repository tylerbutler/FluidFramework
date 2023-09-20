/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export {
	type ConsensusCallback,
	ConsensusResult,
	type IConsensusOrderedCollection,
	type IConsensusOrderedCollectionEvents,
	type IConsensusOrderedCollectionFactory,
	type IOrderedCollection,
	type ISnapshotable,
} from "./interfaces";
export { ConsensusOrderedCollection } from "./consensusOrderedCollection";
export { ConsensusQueue } from "./consensusQueue";
export { acquireAndComplete, waitAcquireAndComplete } from "./testUtils";
