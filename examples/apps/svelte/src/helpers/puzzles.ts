/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import sudoku from "sudokus";

import { Coordinate, type CoordinateString } from "./coordinate";
import { SudokuCell } from "./sudokuCell.svelte";

// export type PuzzleGrid = Map<CoordinateString, SudokuCell>;

export type SudokuNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// export type ValidSudokuValues = SudokuNumber | 0;

type SudokuInputRow = [
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

type SudokuInput = [
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

type SudokuRow = [
	SudokuCell,
	SudokuCell,
	SudokuCell,
	SudokuCell,
	SudokuCell,
	SudokuCell,
	SudokuCell,
	SudokuCell,
	SudokuCell,
];
type SudokuGrid = [
	SudokuRow,
	SudokuRow,
	SudokuRow,
	SudokuRow,
	SudokuRow,
	SudokuRow,
	SudokuRow,
	SudokuRow,
	SudokuRow,
];

export class SudokuPuzzle {
	constructor(public readonly grid: SudokuGrid) {}

	public at(x: SudokuNumber, y: SudokuNumber): SudokuCell {
		return this.grid[x - 1][y - 1];
	}
}

/**
 * An array of numbers 0-9 for convenient looping when building Sudoku grids.
 */
export const PUZZLE_INDEXES = Array.from(Array(9).keys());

export const PUZZLES: SudokuInput[] = [
	[
		[0, 0, 2, 0, 6, 8, 0, 9, 7],
		[4, 0, 6, 3, 0, 9, 0, 0, 0],
		[0, 0, 0, 2, 0, 0, 0, 3, 5],
		[0, 0, 7, 0, 0, 0, 0, 5, 8],
		[6, 0, 8, 0, 0, 0, 7, 0, 4],
		[5, 2, 0, 0, 0, 0, 9, 0, 0],
		[1, 9, 0, 0, 0, 3, 0, 0, 0],
		[0, 0, 0, 7, 0, 4, 8, 0, 9],
		[8, 7, 0, 1, 9, 0, 3, 0, 0],
	],
	[
		[0, 0, 0, 2, 9, 0, 1, 0, 0],
		[6, 0, 0, 5, 0, 1, 0, 7, 0],
		[0, 0, 0, 0, 0, 0, 0, 3, 4],
		[0, 0, 0, 0, 0, 0, 9, 4, 0],
		[4, 5, 0, 3, 0, 0, 0, 6, 2],
		[2, 0, 9, 0, 0, 4, 3, 1, 0],
		[0, 2, 0, 0, 0, 0, 4, 9, 0],
		[0, 0, 6, 0, 0, 8, 0, 0, 0],
		[0, 4, 3, 0, 2, 0, 0, 8, 7],
	],
] as const;

/**
 * Loads a puzzle into an ISharedMap.
 *
 * @param index - The index of the puzzle to load.
 * @param puzzleMap - The shared map that stores puzzle data.
 * @returns The solved puzzle as a 2-dimensional array.
 */
export function loadPuzzle(index: number, puzzleMap: SudokuPuzzle): number[][] {
	const puzzleInput = PUZZLES[index];
	const solution = sudoku.solve(puzzleInput) as unknown as SudokuInput;

	// for (const row of PUZZLE_INDEXES) {
	// 	for (const col of PUZZLE_INDEXES) {
	// 		const key = Coordinate.asString(row, col);
	// 		const cell = new SudokuCell(puzzleInput[row][col], solution[row][col], key);
	// 		puzzleMap.set(key, cell);
	// 	}
	// }
	for (const [row, rowData] of puzzleMap.grid.entries()) {
		for (const [col, cellData] of rowData.entries()) {
			const cell = new SudokuCell(
				puzzleInput[row][col],
				solution[row][col],
				Coordinate.asString(row, col),
			);
			cellData = cell;
		}
	}
	return solution;
}
