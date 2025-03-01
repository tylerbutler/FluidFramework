/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

// import type { SudokuCell } from "./sudokuCell.svelte";

export type SudokuNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export function isSudokuNumber(input: number): input is SudokuNumber {
	return input >= 0 && input <= 9;
}

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

// export type SudokuRow = SudokuCell[];

// export type SudokuGrid = SudokuRow[];
