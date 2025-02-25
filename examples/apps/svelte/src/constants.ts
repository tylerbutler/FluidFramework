/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { SudokuInput } from "./types";

/**
 * An array of numbers 0-8 for convenient looping when building Sudoku grids.
 */
export const PUZZLE_INDEXES = Array.from(Array(9).keys());

/**
 * Sudoku puzzles included as examples.
 */
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
