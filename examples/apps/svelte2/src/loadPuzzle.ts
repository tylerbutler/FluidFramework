/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import sudoku from "sudokus";
import { PUZZLE_INDEXES, PUZZLES } from "./constants";
import type { SudokuAppData } from "./fluid/dataSchema";
import { SudokuInput } from "./sudokuInput";
import { Tree } from "fluid-framework";
import { digest } from "ohash";

function loadPuzzle(existingPuzzle: SudokuAppData, puzzleInput: SudokuInput): SudokuInput {
	let solution: SudokuInput;

	const useCache = true;

	if (useCache) {
		const inputKey = digest(SudokuInput.toString(puzzleInput));
		const cachedSolution = existingPuzzle.solutions.get(inputKey);
		if (cachedSolution === undefined) {
			solution = sudoku.solve(puzzleInput) as unknown as SudokuInput;
		} else {
			solution = SudokuInput.fromString(cachedSolution);
		}
		existingPuzzle.solutions.set(inputKey, SudokuInput.toString(solution));
	} else {
		solution = sudoku.solve(puzzleInput) as unknown as SudokuInput;
	}

	for (const row of PUZZLE_INDEXES) {
		for (const col of PUZZLE_INDEXES) {
			const currentCell = existingPuzzle.grid[row][col];
			Tree.runTransaction(currentCell, (cell) => {
				cell.value = puzzleInput[row][col];
				cell.correctValue = solution[row][col];
				cell.startingClue = puzzleInput[row][col] !== 0;
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
