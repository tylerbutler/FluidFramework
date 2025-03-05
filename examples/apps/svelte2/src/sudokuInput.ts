/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { SudokuNumber } from "./sudokuNumber";

export type SudokuInputRow = [
	SudokuNumber,
	SudokuNumber,
	SudokuNumber,
	SudokuNumber,
	SudokuNumber,
	SudokuNumber,
	SudokuNumber,
	SudokuNumber,
	SudokuNumber,
];

export type SudokuInput = [
	SudokuInputRow,
	SudokuInputRow,
	SudokuInputRow,
	SudokuInputRow,
	SudokuInputRow,
	SudokuInputRow,
	SudokuInputRow,
	SudokuInputRow,
	SudokuInputRow,
];
