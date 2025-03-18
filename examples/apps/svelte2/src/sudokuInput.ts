/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { isSudokuNumber, type SudokuNumber } from "./library/sudokuNumber";

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

export const SudokuInput = {
	toString: (input: SudokuInput) => {
		const rowStrings: string[] = [];
		for (const row of input) {
			const rowString = row.join(" ");
			rowStrings.push(rowString);
		}
		return rowStrings.join("\n");
	},
	fromString: (input: string) => {
		const output: SudokuNumber[][] = [];
		const rowStrings: string[] = input.split("\n");
		for (const rowString of rowStrings) {
			const row = rowString.split(" ");
			const newRow: SudokuNumber[] = [];
			for (const cell of row) {
				const value = Number(cell);
				if (!isSudokuNumber(value)) {
					throw new Error(`Unexpected value in sudoku input string: ${value}`);
				}
				newRow.push(value);
			}
			output.push(newRow);
		}
		return output as SudokuInput;
	},
};
