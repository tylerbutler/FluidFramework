/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import sudoku from "sudokus";
import { Coordinate } from "./coordinate";
import { PUZZLE_INDEXES, PUZZLES } from "./constants";
import type { SudokuInput } from "./types";
import type { SudokuAppData, SudokuGrid } from "./fluid/dataSchema";
import { SudokuCellData } from "./SudokuCell/cellData.svelte";
import { Tree } from "fluid-framework";

export class SudokuPuzzle {
	public grid: SudokuGrid = $state<SudokuGrid>({ grid: [] });

	constructor(readonly puzzleInput: SudokuInput) {
		SudokuPuzzle.loadPuzzle(this, puzzleInput);
	}

	removeAllOwnership(sessionId: string) {
		for (const row of this.grid) {
			for (const cell of row) {
				cell.remoteOwners.delete(sessionId);
			}
		}
	}

	public static loadPuzzle(
		existingPuzzle: SudokuAppData,
		puzzleInput: SudokuInput,
	): SudokuInput {
		// existingPuzzle.grid.length = 0; // Clean the grid; we're rebuilding it.
		const solution = sudoku.solve(puzzleInput) as unknown as SudokuInput;
		for (const row of PUZZLE_INDEXES) {
			// const newRow: SudokuCellData[] = [];
			for (const col of PUZZLE_INDEXES) {
				const currentCell = existingPuzzle.grid[row][col];
				Tree.runTransaction(currentCell, (prop) => {
					prop.value =
				});
				const cell = new SudokuCellData({
					value: puzzleInput[row][col],
					correctValue: solution[row][col],
					coordinate: [row, col],
					startingClue: solution[row][col] === 0,
				});
				existingPuzzle.grid[row][col] = cell;
			}
			// existingPuzzle.grid.push(newRow);
		}
		return solution;
	}
}

/**
 * Loads a puzzle into an ISharedMap.
 *
 * @param index - The index of the puzzle to load.
 * @param grid - The shared map that stores puzzle data.
 * @returns An initialized puzzle.
 */
export function loadIncludedPuzzle(index: number): SudokuPuzzle {
	const puzzleInput = PUZZLES[index];
	const puzzle = new SudokuPuzzle(puzzleInput);
	$inspect(puzzle.grid);
	return puzzle;
}
