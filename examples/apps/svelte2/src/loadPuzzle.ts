/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import sudoku from "sudokus";
import { PUZZLE_INDEXES, PUZZLES } from "./constants";
import type { SudokuInput } from "./types";
import type { SudokuAppData } from "./fluid/dataSchema";
import { Tree } from "fluid-framework";

function loadPuzzle(existingPuzzle: SudokuAppData, puzzleInput: SudokuInput): SudokuInput {
	const solution = sudoku.solve(puzzleInput) as unknown as SudokuInput;
	for (const row of PUZZLE_INDEXES) {
		for (const col of PUZZLE_INDEXES) {
			const currentCell = existingPuzzle.grid[row][col];
			Tree.runTransaction(currentCell, (cell) => {
				cell.value = puzzleInput[row][col];
				cell.correctValue = solution[row][col];
				cell.startingClue = solution[row][col] === 0;
			});
		}
	}
	return solution;
}

/**
 * Loads a puzzle.
 */
export function loadIncludedPuzzle(data: SudokuAppData, index: 0 | 1): SudokuAppData {
	const puzzleInput = PUZZLES[index];
	loadPuzzle(data, puzzleInput);
	return data;
}
