/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

export { SharedNumberSequence } from "./sharedNumberSequence";
export { SharedObjectSequence } from "./sharedObjectSequence";
export {
	type MatrixSegment,
	maxCellPosition,
	maxCol,
	maxCols,
	maxRow,
	maxRows,
	PaddingSegment,
	positionToRowCol,
	rowColToPosition,
	RunSegment,
	SparseMatrix,
	SparseMatrixFactory,
	type SparseMatrixItem,
} from "./sparsematrix";
export { type IJSONRunSegment, SubSequence, SharedSequence } from "./sharedSequence";
